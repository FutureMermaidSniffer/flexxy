

const IMAGE_CONFIG = {
    
    BASE_URL: 'https:
    
    
    IMAGES: {
        
        hero: {
            careerChange: '/images/career-change.jpeg',
            different: '/images/different.png'
        },
        
        
        logos: {
            flexjobs: '/images/FlexJobs_logo-1.png',
            favicon: '/images/f.png',
            cdot: '/images/logo.png'
        },
        
        
        media: {
            today: '/images/Today_logo.svg.png',
            wsj: '/images/wsj.jpg',
            foxnews: '/images/foxnews.png',
            cnbc: '/images/cnbc.png',
            cnn: '/images/cnn.png',
            usatoday: '/images/usatoday.png'
        },
        
        
        testimonials: {
            michelle: '/images/testimonials/michelle.jpg',
            brandon: '/images/testimonials/Brandon.jpeg',
            erin: '/images/testimonials/erin.jpeg'
        },
        
        
        companies: {
            dropbox: 'https:
            netflix: 'https:
            zillow: 'https:
            doordash: 'https:
            reddit: 'https:
        }
    }
};


function getImageUrl(category, imageName) {
    const imagePath = IMAGE_CONFIG.IMAGES[category]?.[imageName];
    if (!imagePath) {
        console.warn(`Image not found: ${category}.${imageName}`);
        return '';
    }
    
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    
    return IMAGE_CONFIG.BASE_URL + imagePath;
}


window.ImageConfig = {
    getImageUrl,
    BASE_URL: IMAGE_CONFIG.BASE_URL,
    IMAGES: IMAGE_CONFIG.IMAGES
};
