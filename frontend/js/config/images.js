// Image Configuration
// Update the BASE_URL to your hosting domain
const IMAGE_CONFIG = {
    // Your hosting base URL - replace with your actual domain
    BASE_URL: 'https://yourdomain.com',
    
    // Image paths organized by category
    IMAGES: {
        // Hero and main images
        hero: {
            careerChange: '/images/career-change.jpeg',
            different: '/images/different.png'
        },
        
        // Logos and branding
        logos: {
            flexjobs: '/images/FlexJobs_logo-1.png',
            favicon: '/images/f.png',
            cdot: '/images/logo.png'
        },
        
        // Media logos (As Seen On section)
        media: {
            today: '/images/Today_logo.svg.png',
            wsj: '/images/wsj.jpg',
            foxnews: '/images/foxnews.png',
            cnbc: '/images/cnbc.png',
            cnn: '/images/cnn.png',
            usatoday: '/images/usatoday.png'
        },
        
        // Testimonial images
        testimonials: {
            michelle: '/images/testimonials/michelle.jpg',
            brandon: '/images/testimonials/Brandon.jpeg',
            erin: '/images/testimonials/erin.jpeg'
        },
        
        // Company logos (external CDN - these are already hosted)
        companies: {
            dropbox: 'https://cdn.worldvectorlogo.com/logos/dropbox-1.svg',
            netflix: 'https://cdn.worldvectorlogo.com/logos/netflix-3.svg',
            zillow: 'https://cdn.worldvectorlogo.com/logos/zillow-1.svg',
            doordash: 'https://cdn.worldvectorlogo.com/logos/doordash-1.svg',
            reddit: 'https://cdn.worldvectorlogo.com/logos/reddit-1.svg'
        }
    }
};

// Helper function to get full image URL
function getImageUrl(category, imageName) {
    const imagePath = IMAGE_CONFIG.IMAGES[category]?.[imageName];
    if (!imagePath) {
        console.warn(`Image not found: ${category}.${imageName}`);
        return '';
    }
    
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Otherwise, combine with base URL
    return IMAGE_CONFIG.BASE_URL + imagePath;
}

// Export for use in other files
window.ImageConfig = {
    getImageUrl,
    BASE_URL: IMAGE_CONFIG.BASE_URL,
    IMAGES: IMAGE_CONFIG.IMAGES
};
