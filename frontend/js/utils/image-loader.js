


class ImageLoader {
    constructor() {
        this.initialized = false;
    }

    
    init() {
        if (this.initialized) return;
        
        
        if (typeof window.ImageConfig === 'undefined') {
            console.warn('ImageConfig not loaded. Please include images.js before image-loader.js');
            return;
        }

        this.updateAllImages();
        this.initialized = true;
    }

    
    updateAllImages() {
        console.log('🖼️ Updating images to use hosted URLs...');

        
        this.updateImagesBySources();
        
        
        this.updateFavicons();
        
        console.log('✅ Image URLs updated successfully');
    }

    
    updateImagesBySources() {
        const imageMap = {
            
            'images/career-change.jpeg': window.ImageConfig.getImageUrl('hero', 'careerChange'),
            'images/different.png': window.ImageConfig.getImageUrl('hero', 'different'),
            
            
            'images/FlexJobs_logo-1.png': window.ImageConfig.getImageUrl('logos', 'flexjobs'),
            'images/logo.png': window.ImageConfig.getImageUrl('logos', 'cdot'),
            
            
            'images/Today_logo.svg.png': window.ImageConfig.getImageUrl('media', 'today'),
            'images/wsj.jpg': window.ImageConfig.getImageUrl('media', 'wsj'),
            'images/foxnews.png': window.ImageConfig.getImageUrl('media', 'foxnews'),
            'images/cnbc.png': window.ImageConfig.getImageUrl('media', 'cnbc'),
            'images/cnn.png': window.ImageConfig.getImageUrl('media', 'cnn'),
            'images/usatoday.png': window.ImageConfig.getImageUrl('media', 'usatoday'),
            
            
            'images/testimonials/michelle.jpg': window.ImageConfig.getImageUrl('testimonials', 'michelle'),
            'images/testimonials/Brandon.jpeg': window.ImageConfig.getImageUrl('testimonials', 'brandon'),
            'images/testimonials/erin.jpeg': window.ImageConfig.getImageUrl('testimonials', 'erin')
        };

        
        document.querySelectorAll('img').forEach(img => {
            const currentSrc = img.getAttribute('src');
            if (currentSrc && imageMap[currentSrc]) {
                img.src = imageMap[currentSrc];
                console.log(`Updated: ${currentSrc} → ${imageMap[currentSrc]}`);
            }
        });
    }

    
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

    
    updateImage(selector, category, imageName) {
        const element = document.querySelector(selector);
        if (element) {
            const newUrl = window.ImageConfig.getImageUrl(category, imageName);
            element.src = newUrl;
            console.log(`Updated ${selector}: ${newUrl}`);
        }
    }

    
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


window.imageLoader = new ImageLoader();


document.addEventListener('DOMContentLoaded', () => {
    window.imageLoader.init();
});


if (document.readyState !== 'loading') {
    window.imageLoader.init();
}
