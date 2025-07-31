#!/usr/bin/env python3
"""
Metadata Remover Script
Removes metadata from photos, videos, HTML, CSS, and JavaScript files.
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
import logging
import re
from datetime import datetime

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import ffmpeg
    FFMPEG_AVAILABLE = True
except ImportError:
    FFMPEG_AVAILABLE = False

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MetadataRemover:
    def __init__(self, backup=True, verbose=False):
        self.backup = backup
        self.verbose = verbose
        self.processed_files = 0
        self.errors = 0
        
        # Supported file extensions
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.webp'}
        self.video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'}
        self.web_extensions = {'.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx'}
        
        # Check dependencies
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if required dependencies are available"""
        if not PIL_AVAILABLE:
            logger.warning("PIL/Pillow not available. Install with: pip install Pillow")
        
        if not FFMPEG_AVAILABLE:
            logger.warning("ffmpeg-python not available. Install with: pip install ffmpeg-python")
            logger.warning("Also ensure FFmpeg is installed on your system")
    
    def _create_backup(self, file_path):
        """Create a backup of the original file"""
        if not self.backup:
            return
        
        backup_path = f"{file_path}.backup"
        counter = 1
        while os.path.exists(backup_path):
            backup_path = f"{file_path}.backup.{counter}"
            counter += 1
        
        shutil.copy2(file_path, backup_path)
        if self.verbose:
            logger.info(f"Backup created: {backup_path}")
    
    def remove_image_metadata(self, file_path):
        """Remove metadata from image files"""
        if not PIL_AVAILABLE:
            logger.error(f"Cannot process {file_path}: PIL/Pillow not available")
            return False
        
        try:
            with Image.open(file_path) as img:
                # Check if image has EXIF data
                if hasattr(img, '_getexif') and img._getexif():
                    if self.verbose:
                        logger.info(f"EXIF data found in {file_path}")
                
                # Create new image without metadata
                data = list(img.getdata())
                clean_img = Image.new(img.mode, img.size)
                clean_img.putdata(data)
                
                # Save without metadata
                self._create_backup(file_path)
                
                # Preserve original format
                save_kwargs = {}
                if img.format == 'JPEG':
                    save_kwargs['quality'] = 95
                    save_kwargs['optimize'] = True
                elif img.format == 'PNG':
                    save_kwargs['optimize'] = True
                
                clean_img.save(file_path, format=img.format, **save_kwargs)
                
                if self.verbose:
                    logger.info(f"Metadata removed from image: {file_path}")
                return True
                
        except Exception as e:
            logger.error(f"Error processing image {file_path}: {str(e)}")
            return False
    
    def remove_video_metadata(self, file_path):
        """Remove metadata from video files"""
        if not FFMPEG_AVAILABLE:
            logger.error(f"Cannot process {file_path}: ffmpeg-python not available")
            return False
        
        try:
            temp_path = f"{file_path}.temp"
            
            # Use ffmpeg to copy video without metadata
            (
                ffmpeg
                .input(file_path)
                .output(temp_path, map_metadata=-1, c='copy')
                .overwrite_output()
                .run(quiet=not self.verbose)
            )
            
            # Replace original file
            self._create_backup(file_path)
            shutil.move(temp_path, file_path)
            
            if self.verbose:
                logger.info(f"Metadata removed from video: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing video {file_path}: {str(e)}")
            # Clean up temp file if it exists
            if os.path.exists(f"{file_path}.temp"):
                os.remove(f"{file_path}.temp")
            return False
    
    def remove_web_file_metadata(self, file_path):
        """Remove metadata/comments from HTML, CSS, and JS files"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            original_content = content
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext in {'.html', '.htm'}:
                content = self._clean_html_metadata(content)
            elif file_ext == '.css':
                content = self._clean_css_metadata(content)
            elif file_ext in {'.js', '.jsx', '.ts', '.tsx'}:
                content = self._clean_js_metadata(content)
            
            # Only save if content changed
            if content != original_content:
                self._create_backup(file_path)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                if self.verbose:
                    logger.info(f"Metadata removed from web file: {file_path}")
                return True
            else:
                if self.verbose:
                    logger.info(f"No metadata found in: {file_path}")
                return True
                
        except Exception as e:
            logger.error(f"Error processing web file {file_path}: {str(e)}")
            return False
    
    def _clean_html_metadata(self, content):
        """Clean HTML metadata"""
        # Remove HTML comments
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
        
        # Remove common tracking meta tags
        tracking_patterns = [
            r'<meta[^>]*name=["\']?generator["\']?[^>]*>',
            r'<meta[^>]*name=["\']?author["\']?[^>]*>',
            r'<meta[^>]*name=["\']?created["\']?[^>]*>',
            r'<meta[^>]*name=["\']?modified["\']?[^>]*>',
            r'<meta[^>]*name=["\']?date["\']?[^>]*>',
            r'<meta[^>]*property=["\']?article:author["\']?[^>]*>',
            r'<meta[^>]*property=["\']?article:published_time["\']?[^>]*>',
            r'<meta[^>]*property=["\']?article:modified_time["\']?[^>]*>',
        ]
        
        for pattern in tracking_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        return content
    
    def _clean_css_metadata(self, content):
        """Clean CSS metadata"""
        # Remove CSS comments
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove common metadata comments
        metadata_patterns = [
            r'@charset.*?;',
            r'/\*\s*Created by.*?\*/',
            r'/\*\s*Author.*?\*/',
            r'/\*\s*Date.*?\*/',
            r'/\*\s*Version.*?\*/',
        ]
        
        for pattern in metadata_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
        
        return content
    
    def _clean_js_metadata(self, content):
        """Clean JavaScript metadata"""
        # Remove single-line comments
        content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
        
        # Remove multi-line comments
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove common metadata patterns
        metadata_patterns = [
            r'@author.*$',
            r'@version.*$',
            r'@date.*$',
            r'@created.*$',
            r'@modified.*$',
            r'@license.*$',
        ]
        
        for pattern in metadata_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.MULTILINE)
        
        return content
    
    def process_file(self, file_path):
        """Process a single file based on its extension"""
        file_path = Path(file_path)
        extension = file_path.suffix.lower()
        
        success = False
        
        if extension in self.image_extensions:
            success = self.remove_image_metadata(str(file_path))
        elif extension in self.video_extensions:
            success = self.remove_video_metadata(str(file_path))
        elif extension in self.web_extensions:
            success = self.remove_web_file_metadata(str(file_path))
        else:
            logger.warning(f"Unsupported file type: {file_path}")
            return False
        
        if success:
            self.processed_files += 1
        else:
            self.errors += 1
        
        return success
    
    def process_directory(self, directory_path, recursive=True):
        """Process all supported files in a directory"""
        directory = Path(directory_path)
        
        if not directory.exists():
            logger.error(f"Directory does not exist: {directory_path}")
            return False
        
        all_extensions = self.image_extensions | self.video_extensions | self.web_extensions
        
        if recursive:
            files = [f for f in directory.rglob('*') if f.suffix.lower() in all_extensions]
        else:
            files = [f for f in directory.iterdir() if f.is_file() and f.suffix.lower() in all_extensions]
        
        logger.info(f"Found {len(files)} supported files to process")
        
        for file_path in files:
            if self.verbose:
                logger.info(f"Processing: {file_path}")
            self.process_file(file_path)
        
        return True
    
    def get_summary(self):
        """Get processing summary"""
        return {
            'processed': self.processed_files,
            'errors': self.errors,
            'total': self.processed_files + self.errors
        }


def main():
    parser = argparse.ArgumentParser(
        description='Remove metadata from photos, videos, and web files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python metadata_remover.py file.jpg                    # Process single file
  python metadata_remover.py /path/to/photos/            # Process directory
  python metadata_remover.py -r /path/to/project/        # Process recursively
  python metadata_remover.py --no-backup file.mp4       # Don't create backups
  python metadata_remover.py -v /path/to/files/          # Verbose output

Supported formats:
  Images: .jpg, .jpeg, .png, .tiff, .tif, .bmp, .webp
  Videos: .mp4, .avi, .mov, .mkv, .wmv, .flv, .webm, .m4v
  Web files: .html, .htm, .css, .js, .jsx, .ts, .tsx
        """
    )
    
    parser.add_argument(
        'path',
        help='File or directory path to process'
    )
    
    parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='Process directories recursively'
    )
    
    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Do not create backup files'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    parser.add_argument(
        '--install-deps',
        action='store_true',
        help='Show installation commands for dependencies'
    )
    
    args = parser.parse_args()
    
    if args.install_deps:
        print("To install required dependencies:")
        print("pip install Pillow ffmpeg-python")
        print("\nFor FFmpeg system installation:")
        print("Windows: Download from https://ffmpeg.org/download.html")
        print("macOS: brew install ffmpeg")
        print("Ubuntu/Debian: sudo apt install ffmpeg")
        print("CentOS/RHEL: sudo yum install ffmpeg")
        return
    
    # Initialize metadata remover
    remover = MetadataRemover(
        backup=not args.no_backup,
        verbose=args.verbose
    )
    
    # Process path
    path = Path(args.path)
    
    if not path.exists():
        logger.error(f"Path does not exist: {args.path}")
        sys.exit(1)
    
    start_time = datetime.now()
    logger.info(f"Starting metadata removal at {start_time}")
    
    if path.is_file():
        remover.process_file(path)
    elif path.is_dir():
        remover.process_directory(path, recursive=args.recursive)
    else:
        logger.error(f"Invalid path: {args.path}")
        sys.exit(1)
    
    # Show summary
    end_time = datetime.now()
    duration = end_time - start_time
    summary = remover.get_summary()
    
    logger.info(f"Processing completed in {duration}")
    logger.info(f"Files processed: {summary['processed']}")
    logger.info(f"Errors encountered: {summary['errors']}")
    logger.info(f"Total files: {summary['total']}")
    
    if summary['errors'] > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
