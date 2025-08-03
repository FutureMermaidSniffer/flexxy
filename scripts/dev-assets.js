#!/usr/bin/env node

/**
 * Local Asset Development Helper
 * 
 * This script helps you manage large assets during development
 * by downloading them from your Contabo server when needed
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CONFIG = {
    ASSETS_BASE_URL: process.env.ASSETS_BASE_URL || 'https://assets.yourdomain.com',
    LOCAL_ASSETS_PATH: './frontend/images',
    CACHE_DIR: './.asset-cache',
    
    // Asset manifest from server
    MANIFEST_URL: '/asset-manifest.json',
    
    // Development placeholders
    PLACEHOLDER_SIZES: {
        'small': '400x300',
        'medium': '800x600', 
        'large': '1920x1080'
    }
};

class AssetDevelopmentHelper {
    constructor() {
        this.manifestCache = null;
        this.downloadQueue = [];
    }

    async initialize() {
        console.log('🔧 Asset Development Helper');
        
        // Create cache directory
        if (!fs.existsSync(CONFIG.CACHE_DIR)) {
            fs.mkdirSync(CONFIG.CACHE_DIR, { recursive: true });
        }
        
        // Load asset manifest
        await this.loadAssetManifest();
    }

    async loadAssetManifest() {
        try {
            const manifestPath = path.join(CONFIG.CACHE_DIR, 'manifest.json');
            
            // Try to load cached manifest
            if (fs.existsSync(manifestPath)) {
                const stat = fs.statSync(manifestPath);
                const age = Date.now() - stat.mtime.getTime();
                
                // Use cache if less than 1 hour old
                if (age < 3600000) {
                    this.manifestCache = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    console.log('📋 Using cached asset manifest');
                    return;
                }
            }
            
            // Download fresh manifest
            console.log('📥 Downloading asset manifest...');
            const manifestUrl = CONFIG.ASSETS_BASE_URL + CONFIG.MANIFEST_URL;
            const manifest = await this.downloadJson(manifestUrl);
            
            // Cache the manifest
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            this.manifestCache = manifest;
            
            console.log(`✅ Loaded manifest with ${manifest.files?.length || 0} assets`);
            
        } catch (error) {
            console.log('⚠️  Could not load asset manifest:', error.message);
            this.manifestCache = { files: [] };
        }
    }

    async downloadJson(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    async downloadFile(url, outputPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(outputPath);
            
            https.get(url, (response) => {
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                
                file.on('error', (error) => {
                    fs.unlink(outputPath, () => {}); // Delete failed download
                    reject(error);
                });
            }).on('error', reject);
        });
    }

    async downloadAsset(assetPath) {
        const url = CONFIG.ASSETS_BASE_URL + '/images/' + assetPath;
        const localPath = path.join(CONFIG.LOCAL_ASSETS_PATH, assetPath);
        const localDir = path.dirname(localPath);
        
        // Create local directory
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        
        console.log(`📥 Downloading ${assetPath}...`);
        
        try {
            await this.downloadFile(url, localPath);
            console.log(`✅ Downloaded ${assetPath}`);
            return true;
        } catch (error) {
            console.log(`❌ Failed to download ${assetPath}:`, error.message);
            return false;
        }
    }

    async createPlaceholder(assetPath, size = 'medium') {
        const localPath = path.join(CONFIG.LOCAL_ASSETS_PATH, assetPath);
        const localDir = path.dirname(localPath);
        const dimensions = CONFIG.PLACEHOLDER_SIZES[size];
        
        // Create local directory
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        
        try {
            // Create placeholder using ImageMagick
            const placeholderCmd = `convert -size ${dimensions} xc:lightgray -gravity center -pointsize 24 -annotate 0 "${path.basename(assetPath)}" "${localPath}"`;
            execSync(placeholderCmd, { stdio: 'ignore' });
            
            console.log(`🖼️  Created placeholder for ${assetPath}`);
            return true;
        } catch (error) {
            console.log(`⚠️  Could not create placeholder for ${assetPath}:`, error.message);
            return false;
        }
    }

    async syncAssets(pattern = null) {
        console.log('🔄 Syncing assets...');
        
        const assetsToSync = this.manifestCache.files.filter(file => {
            if (pattern) {
                return file.path.includes(pattern);
            }
            
            // Only sync missing files
            const localPath = path.join(CONFIG.LOCAL_ASSETS_PATH, file.path);
            return !fs.existsSync(localPath);
        });
        
        if (assetsToSync.length === 0) {
            console.log('✅ All assets are up to date');
            return;
        }
        
        console.log(`📦 Found ${assetsToSync.length} assets to sync`);
        
        for (const asset of assetsToSync) {
            const success = await this.downloadAsset(asset.path);
            
            if (!success) {
                // Create placeholder if download fails
                await this.createPlaceholder(asset.path);
            }
        }
        
        console.log('🎉 Asset sync completed');
    }

    async listAssets() {
        console.log('\n📋 Available Assets:');
        console.log('===================');
        
        for (const asset of this.manifestCache.files) {
            const localPath = path.join(CONFIG.LOCAL_ASSETS_PATH, asset.path);
            const exists = fs.existsSync(localPath);
            const sizeKB = Math.round(asset.originalSize / 1024);
            const status = exists ? '✅' : '❌';
            
            console.log(`${status} ${asset.path} (${sizeKB}KB)`);
        }
    }

    async checkMissingAssets() {
        const missing = [];
        
        for (const asset of this.manifestCache.files) {
            const localPath = path.join(CONFIG.LOCAL_ASSETS_PATH, asset.path);
            if (!fs.existsSync(localPath)) {
                missing.push(asset);
            }
        }
        
        if (missing.length > 0) {
            console.log(`\n⚠️  Missing ${missing.length} assets:`);
            missing.forEach(asset => {
                console.log(`   - ${asset.path}`);
            });
            console.log('\nRun: npm run sync-assets to download them');
        } else {
            console.log('✅ All assets are available locally');
        }
        
        return missing;
    }

    async run(command = 'check', pattern = null) {
        await this.initialize();
        
        switch (command) {
            case 'sync':
                await this.syncAssets(pattern);
                break;
                
            case 'list':
                await this.listAssets();
                break;
                
            case 'check':
            default:
                await this.checkMissingAssets();
                break;
        }
    }
}

// CLI Usage
if (require.main === module) {
    const [,, command, pattern] = process.argv;
    const helper = new AssetDevelopmentHelper();
    
    helper.run(command, pattern).catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = AssetDevelopmentHelper;
