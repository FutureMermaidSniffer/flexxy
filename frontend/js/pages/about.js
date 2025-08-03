

document.addEventListener('DOMContentLoaded', function() {
    
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'About FlexJobs',
            subtitle: 'Since 2007, FlexJobs has been the #1 job site for finding the best flexible work opportunities.'
        },
        onSearch: function(data) {
            
            console.log('Job search:', data.searchTerm, data.location);
            if (data.searchTerm || data.location) {
                const params = new URLSearchParams();
                if (data.searchTerm) params.append('q', data.searchTerm);
                if (data.location) params.append('location', data.location);
                
            }
        },
        container: '#main-header-container'
    });
    
    
    const carousel = document.getElementById('testimonialsCarousel');
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slides = document.querySelectorAll('.testimonial-slide');
    
    if (!carousel || !track || !prevBtn || !nextBtn || slides.length === 0) {
        console.warn('Testimonials carousel elements not found');
        return;
    }
    
    let currentIndex = 0;
    let slidesToShow = 2; 
    let maxIndex = slides.length - slidesToShow;
    
    
    function updateSlidesToShow() {
        if (window.innerWidth <= 767) {
            slidesToShow = 1; 
        } else {
            slidesToShow = 2; 
        }
        maxIndex = slides.length - slidesToShow;
        
        
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        
        updateCarousel();
        updateButtons();
    }
    
    
    function updateCarousel() {
        const slideWidth = 100 / slidesToShow;
        const translateX = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${translateX}%)`;
    }
    
    
    function updateButtons() {
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
            updateButtons();
        }
    });
    
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
            updateButtons();
        }
    });
    
    
    window.addEventListener('resize', updateSlidesToShow);
    
    
    updateSlidesToShow();
    
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });
    
    
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && !nextBtn.disabled) {
                
                nextBtn.click();
            } else if (diff < 0 && !prevBtn.disabled) {
                
                prevBtn.click();
            }
        }
    }
});
