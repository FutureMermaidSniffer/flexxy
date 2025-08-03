# Large Asset Management for Contabo Hosting

## Overview

This guide explains how to manage large assets (videos, high-res images) that are too big for GitHub but need to be hosted on your Contabo server.

## Current Infrastructure

Your FlexJobs project already has:
- ✅ Asset deployment pipeline (`deploy-assets.yml`)
- ✅ Image configuration system (`frontend/js/config/images.js`)
- ✅ Nginx configuration for asset serving
- ✅ Compression and optimization

## Strategy for Large Files

### 1. **File Size Categories**

- **Small files (< 1MB)**: Can be stored in GitHub
- **Medium files (1-10MB)**: Compressed and deployed via GitHub Actions
- **Large files (> 10MB)**: Stored externally and deployed separately

### 2. **Storage Options**

#### Option A: Direct Server Upload
```bash
# Manual upload to Contabo server
scp -r large-assets/ user@your-contabo-server.com:/var/www/assets/
```

#### Option B: Cloud Storage + CDN
```bash
# Store in cloud and sync to server
rclone sync gdrive:assets/ /var/www/assets/
```

#### Option C: Automated GitHub Actions
Use the provided `upload-large-assets.js` script via GitHub Actions.

## Setup Instructions

### 1. **Configure GitHub Secrets**

Add these secrets to your GitHub repository:

```
SERVER_HOST=your-contabo-server.com
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN PRIVATE KEY-----...
SERVER_PORT=22
ASSETS_BASE_URL=https://assets.yourdomain.com
```

### 2. **Update Environment Variables**

In your `.env` file:
```bash
# Asset Configuration
ASSETS_BASE_URL=https://assets.yourdomain.com
COMPRESSION_ENABLED=true
MAX_FILE_SIZE=52428800  # 50MB
```

### 3. **Configure Contabo Server**

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name assets.yourdomain.com;
    
    root /var/www/assets;
    
    # Large file handling
    client_max_body_size 100M;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;
    
    # Cache headers
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }
    
    location ~* \.(mp4|webm|ogg|mov|avi)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
        
        # Enable range requests for video
        add_header Accept-Ranges bytes;
    }
}
```

### 4. **Workflow Usage**

#### Automatic Deployment
```bash
# Trigger via GitHub Actions
git push origin main  # Automatically deploys small/medium assets

# Manual trigger for large assets
# Go to Actions tab > "Deploy Large Assets to Contabo" > Run workflow
```

#### Manual Upload
```bash
# Use the upload script directly
node scripts/upload-large-assets.js
```

## File Organization

### Recommended Structure
```
/var/www/assets/
├── images/
│   ├── thumbnails/          # Small images (< 100KB)
│   ├── gallery/            # Medium images (1-5MB) 
│   └── high-res/           # Large images (> 5MB)
├── videos/
│   ├── previews/           # Video thumbnails
│   ├── compressed/         # Optimized videos
│   └── original/           # High-quality originals
├── documents/
└── fonts/
```

### Git Management
```bash
# .gitignore additions for large files
frontend/images/high-res/*.jpg
frontend/images/high-res/*.png
frontend/videos/**/*.mp4
frontend/videos/**/*.mov

# Keep optimized versions
!frontend/images/high-res/*_optimized.*
!frontend/videos/**/*_compressed.*
```

## Asset URL Management

### Dynamic Loading
Your existing `frontend/js/config/images.js` system handles URL switching:

```javascript
const IMAGE_CONFIG = {
    BASE_URL: 'https://assets.yourdomain.com',  // Points to Contabo
    
    IMAGES: {
        hero: {
            highRes: '/images/high-res/hero-4k.jpg',        # Large file on server
            standard: '/images/hero.jpg'                     # Smaller version in repo
        }
    }
};
```

### Fallback Strategy
```javascript
// In your image loader
function loadImage(imagePath) {
    const img = new Image();
    
    // Try high-res version first
    img.src = IMAGE_CONFIG.BASE_URL + imagePath.highRes;
    
    img.onerror = function() {
        // Fallback to standard version
        img.src = IMAGE_CONFIG.BASE_URL + imagePath.standard;
    };
    
    return img;
}
```

## Monitoring and Maintenance

### Automated Checks
```bash
# Monitor disk usage
df -h /var/www/assets

# Check asset accessibility
curl -I https://assets.yourdomain.com/images/test.jpg

# Bandwidth monitoring
tail -f /var/log/nginx/access.log | grep assets
```

### Performance Optimization
1. **Enable HTTP/2** on your Contabo server
2. **Set up CloudFlare** for additional CDN layer
3. **Monitor Core Web Vitals** for image loading performance
4. **Implement lazy loading** for large images

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
   - Verify server disk space: `df -h`
   - Check network connectivity to Contabo

2. **Assets Not Loading**
   - Verify nginx configuration
   - Check file permissions: `chmod 755 /var/www/assets`
   - Test CORS headers

3. **Slow Loading**
   - Enable gzip compression
   - Check image optimization
   - Consider implementing WebP format

### Backup Strategy
```bash
# Weekly backup to external storage
rsync -av /var/www/assets/ backup-server:/backups/assets/

# Or use cloud backup
rclone sync /var/www/assets/ gdrive:backups/assets/
```

## Security Considerations

1. **Access Control**: Restrict SSH access to your IP
2. **File Types**: Validate uploaded file extensions
3. **Size Limits**: Set nginx `client_max_body_size`
4. **Hotlinking Protection**: Configure nginx to prevent unauthorized access

## Next Steps

1. Set up the GitHub secrets
2. Configure your Contabo server nginx
3. Test the upload script with a small file
4. Run the GitHub Action workflow
5. Update your image URLs to point to the new CDN

This setup gives you a robust asset hosting solution that scales with your project needs!
