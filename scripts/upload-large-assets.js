#!/usr/bin/env node

/**
 * Upload Large Assets to Contabo Server
 * 
 * This script handles uploading large files that can't be stored in GitHub
 * to your Contabo server via SSH/SFTP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
    SERVER_HOST: process.env.SERVER_HOST || 'your-contabo-server.com',
    SERVER_USER: process.env.SERVER_USER || 'root',
    SERVER_PORT: process.env.SERVER_PORT || '22',
    ASSETS_PATH: '/var/www/assets',
    LOCAL_ASSETS_PATH: './frontend/images',
    
    // Define large file patterns
    LARGE_FILE_PATTERNS: [
        '*.mp4',
        '*.mov',
        '*.avi',
        '*.mkv',
        '*.webm',
        '*.jpg',
        '*.jpeg',
        '*.png',
        '*.gif'
    ],
    
    // Files larger than this size (in bytes) will be processed
    SIZE_THRESHOLD: 1024 * 1024, // 1MB
    
    // Compression settings
    COMPRESSION: {
        images: {
            quality: 85,
            progressive: true,
            strip: true
        },
        videos: {
            crf: 28,
            preset: 'medium'
        }
    }
};

class AssetUploader {
    constructor() {
        this.sshKeyPath = process.env.SSH_KEY_PATH || '~/.ssh/id_rsa';
        this.tempDir = './temp_assets';
        this.uploadQueue = [];
    }

    async initialize() {
        console.log('🚀 Initializing Asset Uploader...');
        
        // Create temp directory
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        
        // Check if required tools are installed
        await this.checkDependencies();
    }

    async checkDependencies() {
        const tools = ['rsync', 'ffmpeg', 'imagemagick'];
        
        for (const tool of tools) {
            try {
                execSync(`which ${tool}`, { stdio: 'ignore' });
                console.log(`✅ ${tool} is available`);
            } catch (error) {
                console.log(`⚠️  ${tool} not found - some features may be limited`);
            }
        }
    }

    async findLargeFiles() {
        console.log('🔍 Scanning for large files...');
        
        const largeFiles = [];
        
        function scanDirectory(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (stat.size > CONFIG.SIZE_THRESHOLD) {
                    largeFiles.push({
                        path: fullPath,
                        size: stat.size,
                        relativePath: path.relative(CONFIG.LOCAL_ASSETS_PATH, fullPath)
                    });
                }
            }
        }
        
        if (fs.existsSync(CONFIG.LOCAL_ASSETS_PATH)) {
            scanDirectory(CONFIG.LOCAL_ASSETS_PATH);
        }
        
        console.log(`📦 Found ${largeFiles.length} large files`);
        return largeFiles;
    }

    async compressFile(file) {
        const ext = path.extname(file.path).toLowerCase();
        const outputPath = path.join(this.tempDir, file.relativePath);
        const outputDir = path.dirname(outputPath);
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        console.log(`🗜️  Compressing ${file.relativePath}...`);
        
        try {
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                // Image compression with ImageMagick
                const quality = CONFIG.COMPRESSION.images.quality;
                execSync(`convert "${file.path}" -quality ${quality} -strip "${outputPath}"`, { stdio: 'inherit' });
                
            } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
                // Video compression with FFmpeg
                const crf = CONFIG.COMPRESSION.videos.crf;
                const preset = CONFIG.COMPRESSION.videos.preset;
                execSync(`ffmpeg -i "${file.path}" -c:v libx264 -crf ${crf} -preset ${preset} -c:a aac "${outputPath}"`, { stdio: 'inherit' });
                
            } else {
                // Just copy the file
                fs.copyFileSync(file.path, outputPath);
            }
            
            const compressedSize = fs.statSync(outputPath).size;
            const savings = ((file.size - compressedSize) / file.size * 100).toFixed(1);
            console.log(`✅ Compressed ${file.relativePath} (${savings}% reduction)`);
            
            return outputPath;
            
        } catch (error) {
            console.error(`❌ Failed to compress ${file.relativePath}:`, error.message);
            // Fall back to copying original file
            fs.copyFileSync(file.path, outputPath);
            return outputPath;
        }
    }

    async uploadToServer() {
        console.log('🚀 Uploading assets to Contabo server...');
        
        try {
            // Create remote directory
            const createDirCmd = `ssh -i ${this.sshKeyPath} -p ${CONFIG.SERVER_PORT} ${CONFIG.SERVER_USER}@${CONFIG.SERVER_HOST} "mkdir -p ${CONFIG.ASSETS_PATH}/images"`;
            execSync(createDirCmd, { stdio: 'inherit' });
            
            // Upload files using rsync
            const rsyncCmd = `rsync -avz --progress -e "ssh -i ${this.sshKeyPath} -p ${CONFIG.SERVER_PORT}" ${this.tempDir}/ ${CONFIG.SERVER_USER}@${CONFIG.SERVER_HOST}:${CONFIG.ASSETS_PATH}/`;
            execSync(rsyncCmd, { stdio: 'inherit' });
            
            // Set correct permissions
            const permissionsCmd = `ssh -i ${this.sshKeyPath} -p ${CONFIG.SERVER_PORT} ${CONFIG.SERVER_USER}@${CONFIG.SERVER_HOST} "chown -R www-data:www-data ${CONFIG.ASSETS_PATH} && chmod -R 755 ${CONFIG.ASSETS_PATH}"`;
            execSync(permissionsCmd, { stdio: 'inherit' });
            
            console.log('✅ Upload completed successfully!');
            
        } catch (error) {
            console.error('❌ Upload failed:', error.message);
            throw error;
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up temporary files...');
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
    }

    async run() {
        try {
            await this.initialize();
            
            const largeFiles = await this.findLargeFiles();
            
            if (largeFiles.length === 0) {
                console.log('📝 No large files found to upload');
                return;
            }
            
            // Compress files
            for (const file of largeFiles) {
                await this.compressFile(file);
            }
            
            // Upload to server
            await this.uploadToServer();
            
            // Generate asset manifest
            await this.generateAssetManifest(largeFiles);
            
            console.log('🎉 Asset upload completed successfully!');
            
        } catch (error) {
            console.error('❌ Process failed:', error.message);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }

    async generateAssetManifest(files) {
        const manifest = {
            uploadDate: new Date().toISOString(),
            files: files.map(f => ({
                path: f.relativePath,
                originalSize: f.size,
                url: `${process.env.ASSETS_BASE_URL || 'https://assets.yourdomain.com'}/images/${f.relativePath}`
            }))
        };
        
        fs.writeFileSync('./asset-manifest.json', JSON.stringify(manifest, null, 2));
        console.log('📄 Generated asset manifest');
    }
}

// CLI Usage
if (require.main === module) {
    const uploader = new AssetUploader();
    uploader.run();
}

module.exports = AssetUploader;
