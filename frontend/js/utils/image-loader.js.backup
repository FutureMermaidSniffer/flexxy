// Image Loader Utility
// This script updates all images on a page to use hosted URLs

class ImageLoader {
    constructor() {
        this.initialized = false;
    }

    // Initialize image loading
    init() {
        if (this.initialized) return;
        
        // Wait for image config to be available
        if (typeof window.ImageConfig === 'undefined') {
            console.warn('ImageConfig not loaded. Please include images.js before image-loader.js');
            return;
        }

        this.updateAllImages();
        this.initialized = true;
    }

    // Update all images on the current page
    updateAllImages() {
        console.log('🖼️ Updating images to use hosted URLs...');

        // Update specific images by their selectors
        this.updateImagesBySources();
        
        // Update favicons
        this.updateFavicons();
        
        console.log('✅ Image URLs updated successfully');
    }

    // Update images based on their current src attributes
    updateImagesBySources() {
        const imageMap = {
            // Hero images
            'images/career-change.jpeg': window.ImageConfig.getImageUrl('hero', 'careerChange'),
            'images/different.png': window.ImageConfig.getImageUrl('hero', 'different'),
            
            // Logos
            'images/FlexJobs_logo-1.png': window.ImageConfig.getImageUrl('logos', 'flexjobs'),
            'images/logo.png': window.ImageConfig.getImageUrl('logos', 'cdot'),
            
            // Media logos
            'images/Today_logo.svg.png': window.ImageConfig.getImageUrl('media', 'today'),
            'images/wsj.jpg': window.ImageConfig.getImageUrl('media', 'wsj'),
            'images/foxnews.png': window.ImageConfig.getImageUrl('media', 'foxnews'),
            'images/cnbc.png': window.ImageConfig.getImageUrl('media', 'cnbc'),
            'images/cnn.png': window.ImageConfig.getImageUrl('media', 'cnn'),
            'images/usatoday.png': window.ImageConfig.getImageUrl('media', 'usatoday'),
            
            // Testimonials
            'images/testimonials/michelle.jpg': window.ImageConfig.getImageUrl('testimonials', 'michelle'),
            'images/testimonials/Brandon.jpeg': window.ImageConfig.getImageUrl('testimonials', 'brandon'),
            'images/testimonials/erin.jpeg': window.ImageConfig.getImageUrl('testimonials', 'erin')
        };

        // Update all img elements
        document.querySelectorAll('img').forEach(img => {
            const currentSrc = img.getAttribute('src');
            if (currentSrc && imageMap[currentSrc]) {
                img.src = imageMap[currentSrc];
                console.log(`Updated: ${currentSrc} → ${imageMap[currentSrc]}`);
            }
        });
    }

    // Update favicon links
    updateFavicons() {
        const faviconSelectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="apple-touch-icon"]'
        ];

        faviconSelectors.forEach(selector => {
            const link = document.querySelector(selector);
            if (link && link.href && link.href.includes('images/f.png')) {
                link.href = window.ImageConfig.getImageUrl('logos', 'favicon');
                console.log(`Updated favicon: ${link.href}`);
            }
        });
    }

    // Method to update a specific image
    updateImage(selector, category, imageName) {
        const element = document.querySelector(selector);
        if (element) {
            const newUrl = window.ImageConfig.getImageUrl(category, imageName);
            element.src = newUrl;
            console.log(`Updated ${selector}: ${newUrl}`);
        }
    }

    // Method to preload critical images
    preloadImages(imageList = []) {
        const criticalImages = imageList.length > 0 ? imageList : [
            window.ImageConfig.getImageUrl('hero', 'careerChange'),
            window.ImageConfig.getImageUrl('logos', 'flexjobs'),
            window.ImageConfig.getImageUrl('hero', 'different')
        ];

        criticalImages.forEach(url => {
            if (url) {
                const img = new Image();
                img.src = url;
            }
        });

        console.log('🚀 Preloaded critical images');
    }
}

// Create global instance
window.imageLoader = new ImageLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageLoader.init();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    window.imageLoader.init();
}
