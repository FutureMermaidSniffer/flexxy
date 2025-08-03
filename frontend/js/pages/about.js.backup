/**
 * About Page JavaScript
 * Initializes the main header component for the about page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main header
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'About FlexJobs',
            subtitle: 'Since 2007, FlexJobs has been the #1 job site for finding the best flexible work opportunities.'
        },
        onSearch: function(data) {
            // Handle job search
            console.log('Job search:', data.searchTerm, data.location);
            if (data.searchTerm || data.location) {
                const params = new URLSearchParams();
                if (data.searchTerm) params.append('q', data.searchTerm);
                if (data.location) params.append('location', data.location);
                // window.location.href = `/browse-jobs?${params.toString()}`;
            }
        },
        container: '#main-header-container'
    });
    
    // Testimonials Carousel Functionality
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
    let slidesToShow = 2; // Default for desktop
    let maxIndex = slides.length - slidesToShow;
    
    // Function to update slides to show based on screen size
    function updateSlidesToShow() {
        if (window.innerWidth <= 767) {
            slidesToShow = 1; // Mobile: show 1 slide
        } else {
            slidesToShow = 2; // Desktop: show 2 slides
        }
        maxIndex = slides.length - slidesToShow;
        
        // Reset to first slide if current index is out of bounds
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        
        updateCarousel();
        updateButtons();
    }
    
    // Function to update carousel position
    function updateCarousel() {
        const slideWidth = 100 / slidesToShow;
        const translateX = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${translateX}%)`;
    }
    
    // Function to update button states
    function updateButtons() {
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    // Previous button click handler
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
            updateButtons();
        }
    });
    
    // Next button click handler
    nextBtn.addEventListener('click', function() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
            updateButtons();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', updateSlidesToShow);
    
    // Initialize carousel
    updateSlidesToShow();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });
    
    // Touch/swipe support for mobile
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
                // Swipe left (next)
                nextBtn.click();
            } else if (diff < 0 && !prevBtn.disabled) {
                // Swipe right (previous)
                prevBtn.click();
            }
        }
    }
});
