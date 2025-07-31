# Image Hosting Setup Guide

## Quick Setup Steps

### 1. Upload Your Images to Your Hosting
Upload all images from your `frontend/images/` folder to your hosting server, maintaining the same folder structure:

```
your-hosting-domain.com/
├── images/
│   ├── career-change.jpeg
│   ├── different.png
│   ├── f.png
│   ├── FlexJobs_logo-1.png
│   ├── logo.png
│   ├── Today_logo.svg.png
│   ├── wsj.jpg
│   ├── foxnews.png
│   ├── cnbc.png
│   ├── cnn.png
│   ├── usatoday.png
│   └── testimonials/
│       ├── michelle.jpg
│       ├── Brandon.jpeg
│       └── erin.jpeg
```

### 2. Update the Base URL
In `frontend/js/config/images.js`, update line 4:

```javascript
BASE_URL: 'https://yourdomain.com',  // Replace with your actual domain
```

**Example:**
```javascript
BASE_URL: 'https://mysite.com',
// or
BASE_URL: 'https://cdn.mysite.com',
// or  
BASE_URL: 'https://images.mysite.com',
```

### 3. That's It!
The image loader will automatically update all image URLs when pages load.

## Alternative Methods

### Method 1: Direct URL Replacement
Manually replace image sources in HTML files:

```html
<!-- Before -->
<img src="images/career-change.jpeg" alt="Hero image">

<!-- After -->
<img src="https://yourdomain.com/images/career-change.jpeg" alt="Hero image">
```

### Method 2: CDN Integration
If using a CDN like Cloudflare, AWS CloudFront, or similar:

```javascript
BASE_URL: 'https://d1234567890.cloudfront.net',
```

### Method 3: Multiple Domains
For load balancing across multiple image servers:

```javascript
// In images.js, you can modify the getImageUrl function:
function getImageUrl(category, imageName) {
    const imagePath = IMAGE_CONFIG.IMAGES[category]?.[imageName];
    if (!imagePath) {
        console.warn(`Image not found: ${category}.${imageName}`);
        return '';
    }
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Use different domains for different image types
    let baseUrl = IMAGE_CONFIG.BASE_URL;
    if (category === 'testimonials') {
        baseUrl = 'https://cdn1.yourdomain.com';
    } else if (category === 'media') {
        baseUrl = 'https://cdn2.yourdomain.com';
    }
    
    return baseUrl + imagePath;
}
```

## Benefits of This Approach

✅ **Centralized Management**: All image URLs managed in one place
✅ **Easy Updates**: Change base URL once to update all images  
✅ **Development Friendly**: Can switch between local and hosted images easily
✅ **Performance**: Can preload critical images
✅ **CDN Ready**: Easy integration with CDNs
✅ **Fallback Support**: Can add error handling for missing images

## Testing

1. Update your BASE_URL in `js/config/images.js`
2. Open your website
3. Check browser console for "Updated:" messages
4. Verify images are loading from your hosting URLs
5. Check Network tab in DevTools to confirm image sources

## Troubleshooting

- **Images not loading**: Check if BASE_URL is correct and images are uploaded
- **CORS errors**: Ensure your hosting allows cross-origin requests
- **Console warnings**: Check if image paths in config match your folder structure
- **Mixed content**: Use HTTPS for both your site and image hosting
