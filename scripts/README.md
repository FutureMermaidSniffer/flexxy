# Metadata Remover Tool

A comprehensive Python script that removes metadata from photos, videos, and web files (HTML, CSS, JavaScript) to protect your privacy and prevent tracking.

## 🚀 Features

- **Image Processing**: Removes EXIF data from photos (JPEG, PNG, TIFF, BMP, WebP)
- **Video Processing**: Strips metadata from videos (MP4, AVI, MOV, MKV, etc.)
- **Web File Cleaning**: Removes comments and tracking metadata from HTML, CSS, and JS files
- **Backup Creation**: Automatically creates backups before processing (optional)
- **Batch Processing**: Process individual files or entire directories
- **Recursive Processing**: Scan subdirectories automatically
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📋 Requirements

### Python Dependencies
```bash
pip install -r requirements.txt
```

### System Requirements
- Python 3.6+
- FFmpeg (for video processing)

### Installing FFmpeg

**Windows:**
1. Download from [FFmpeg official website](https://ffmpeg.org/download.html)
2. Extract and add to your system PATH

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**CentOS/RHEL:**
```bash
sudo yum install ffmpeg
```

## 🛠️ Installation

1. **Clone or download** the script files to your computer
2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Install FFmpeg** (see system requirements above)
4. **Verify installation:**
   ```bash
   python metadata_remover.py --install-deps
   ```

## 📖 Usage

### Command Line

#### Basic Usage
```bash
# Process a single file
python metadata_remover.py photo.jpg

# Process a directory
python metadata_remover.py /path/to/photos/

# Process recursively
python metadata_remover.py -r /path/to/project/
```

#### Advanced Options
```bash
# Verbose output
python metadata_remover.py -v /path/to/files/

# Don't create backups
python metadata_remover.py --no-backup file.mp4

# Combine options
python metadata_remover.py -rv --no-backup /path/to/project/
```

### Windows Batch File

For Windows users, use the included batch file:

1. **Double-click** `metadata_remover.bat` for interactive mode
2. **Drag and drop** files/folders onto the batch file
3. **Command line:** `metadata_remover.bat "C:\path\to\files" -r`

### Supported File Types

| Category | Extensions |
|----------|------------|
| **Images** | .jpg, .jpeg, .png, .tiff, .tif, .bmp, .webp |
| **Videos** | .mp4, .avi, .mov, .mkv, .wmv, .flv, .webm, .m4v |
| **Web Files** | .html, .htm, .css, .js, .jsx, .ts, .tsx |

## 🔒 What Metadata is Removed

### Images (EXIF Data)
- Camera make and model
- GPS coordinates
- Date and time taken
- Camera settings (ISO, aperture, etc.)
- Software used
- Copyright information

### Videos
- Creation date and time
- Camera/device information
- GPS location data
- Software metadata
- Encoding details

### Web Files
- HTML comments
- Author information
- Creation/modification dates
- Generator metadata
- CSS/JS comments
- Version information

## ⚠️ Important Notes

### Backup System
- **Default behavior**: Creates `.backup` files before processing
- **Disable with**: `--no-backup` flag
- **Multiple backups**: Automatically numbered (e.g., `.backup.1`, `.backup.2`)

### Quality Preservation
- **Images**: Maintains original quality (95% JPEG quality)
- **Videos**: Uses stream copy to avoid re-encoding
- **Web files**: Preserves formatting and functionality

### Limitations
- **Videos**: Requires FFmpeg installation
- **Large files**: Processing time increases with file size
- **Corrupted files**: May fail processing damaged files

## 🔧 Troubleshooting

### Common Issues

**"PIL/Pillow not available"**
```bash
pip install Pillow
```

**"ffmpeg-python not available"**
```bash
pip install ffmpeg-python
# Also install system FFmpeg
```

**"Permission denied"**
- Ensure files aren't open in other applications
- Check file permissions
- Run as administrator (Windows) or with sudo (Linux/macOS)

**"File not found"**
- Check file paths are correct
- Use absolute paths for clarity
- Ensure files exist and are accessible

### Getting Help

Run with `--help` for detailed usage information:
```bash
python metadata_remover.py --help
```

## 📊 Example Output

```
2024-01-20 10:30:15 - INFO - Starting metadata removal at 2024-01-20 10:30:15
2024-01-20 10:30:15 - INFO - Found 25 supported files to process
2024-01-20 10:30:15 - INFO - Processing: /photos/IMG_001.jpg
2024-01-20 10:30:15 - INFO - Backup created: /photos/IMG_001.jpg.backup
2024-01-20 10:30:15 - INFO - Metadata removed from image: /photos/IMG_001.jpg
...
2024-01-20 10:30:45 - INFO - Processing completed in 0:00:30
2024-01-20 10:30:45 - INFO - Files processed: 23
2024-01-20 10:30:45 - INFO - Errors encountered: 2
2024-01-20 10:30:45 - INFO - Total files: 25
```

## 🛡️ Privacy & Security

This tool helps protect your privacy by:

- **Removing location data** from photos and videos
- **Stripping device information** that could identify your equipment
- **Cleaning timestamps** that reveal when content was created
- **Removing comments and metadata** from web files that could contain sensitive information

## 📄 License

This project is provided as-is for educational and privacy protection purposes. Use responsibly and ensure you have the right to modify the files you're processing.

## 🤝 Contributing

Feel free to submit issues, feature requests, or improvements to make this tool even better!

---

**Remember**: Always test on a small set of files first and verify the backups work before processing important data!
