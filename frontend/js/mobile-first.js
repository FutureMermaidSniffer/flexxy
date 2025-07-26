/**
 * Mobile-First Utilities for FlexJobs
 * Provides device detection and mobile-specific functionality
 */

class MobileFirstUtils {
    constructor() {
        this.breakpoints = {
            mobile: 0,
            mobileLarge: 414,
            tablet: 768,
            desktop: 992,
            desktopLarge: 1200,
            desktopXL: 1400
        };
        
        this.init();
    }
    
    init() {
        this.detectDevice();
        this.setupResizeListener();
        this.setupTouchEvents();
        this.optimizeForDevice();
    }
    
    /**
     * Detect current device type
     */
    detectDevice() {
        const width = window.innerWidth;
        
        if (width < this.breakpoints.tablet) {
            this.currentDevice = 'mobile';
            this.isMobile = true;
            this.isTablet = false;
            this.isDesktop = false;
        } else if (width < this.breakpoints.desktop) {
            this.currentDevice = 'tablet';
            this.isMobile = false;
            this.isTablet = true;
            this.isDesktop = false;
        } else {
            this.currentDevice = 'desktop';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = true;
        }
        
        // Add device class to body
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        document.body.classList.add(`device-${this.currentDevice}`);
        
        // Set data attribute for CSS targeting
        document.body.setAttribute('data-device', this.currentDevice);
    }
    
    /**
     * Setup resize listener for device changes
     */
    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const previousDevice = this.currentDevice;
                this.detectDevice();
                
                if (previousDevice !== this.currentDevice) {
                    this.onDeviceChange(previousDevice, this.currentDevice);
                }
            }, 150);
        });
    }
    
    /**
     * Setup touch events for mobile devices
     */
    setupTouchEvents() {
        if (this.isTouchDevice()) {
            document.body.classList.add('touch-device');
            
            // Add touch feedback to buttons
            document.querySelectorAll('.btn, .card, .nav-link').forEach(element => {
                element.addEventListener('touchstart', () => {
                    element.classList.add('touching');
                });
                
                element.addEventListener('touchend', () => {
                    setTimeout(() => {
                        element.classList.remove('touching');
                    }, 150);
                });
            });
        }
    }
    
    /**
     * Optimize interface for current device
     */
    optimizeForDevice() {
        if (this.isMobile) {
            this.optimizeForMobile();
        } else if (this.isTablet) {
            this.optimizeForTablet();
        } else {
            this.optimizeForDesktop();
        }
    }
    
    /**
     * Mobile-specific optimizations
     */
    optimizeForMobile() {
        // Disable hover effects on mobile
        document.documentElement.style.setProperty('--hover-enabled', '0');
        
        // Add mobile-specific classes
        document.body.classList.add('mobile-optimized');
        
        // Optimize form inputs for mobile
        this.optimizeMobileForms();
        
        // Setup mobile navigation
        this.setupMobileNavigation();
    }
    
    /**
     * Tablet-specific optimizations
     */
    optimizeForTablet() {
        document.documentElement.style.setProperty('--hover-enabled', '0.5');
        document.body.classList.add('tablet-optimized');
    }
    
    /**
     * Desktop-specific optimizations
     */
    optimizeForDesktop() {
        // Enable full hover effects
        document.documentElement.style.setProperty('--hover-enabled', '1');
        document.body.classList.add('desktop-optimized');
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Enable tooltips
        this.enableTooltips();
    }
    
    /**
     * Optimize forms for mobile
     */
    optimizeMobileForms() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            if (parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
            
            // Add mobile-friendly attributes
            input.setAttribute('autocomplete', 'on');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
        });
    }
    
    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        const navToggle = document.querySelector('.navbar-toggler');
        const navCollapse = document.querySelector('.navbar-collapse');
        
        if (navToggle && navCollapse) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                
                // Add animation classes
                if (isExpanded) {
                    navCollapse.classList.add('collapsing');
                    setTimeout(() => {
                        navCollapse.classList.remove('collapsing');
                    }, 300);
                }
            });
        }
    }
    
    /**
     * Setup keyboard navigation for desktop
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modalInstance = bootstrap.Modal.getInstance(openModal);
                    modalInstance?.hide();
                }
            }
            
            // Enter key submits forms
            if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
                const form = e.target.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
                    submitBtn?.click();
                }
            }
        });
    }
    
    /**
     * Enable tooltips for desktop
     */
    enableTooltips() {
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach(element => {
            new bootstrap.Tooltip(element);
        });
    }
    
    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    /**
     * Get current breakpoint
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.desktopXL) return 'desktopXL';
        if (width >= this.breakpoints.desktopLarge) return 'desktopLarge';
        if (width >= this.breakpoints.desktop) return 'desktop';
        if (width >= this.breakpoints.tablet) return 'tablet';
        if (width >= this.breakpoints.mobileLarge) return 'mobileLarge';
        return 'mobile';
    }
    
    /**
     * Check if current device matches breakpoint
     */
    isBreakpoint(breakpoint) {
        return this.getCurrentBreakpoint() === breakpoint;
    }
    
    /**
     * Check if current device is at least the specified breakpoint
     */
    isBreakpointUp(breakpoint) {
        const current = this.getCurrentBreakpoint();
        const breakpointOrder = ['mobile', 'mobileLarge', 'tablet', 'desktop', 'desktopLarge', 'desktopXL'];
        
        return breakpointOrder.indexOf(current) >= breakpointOrder.indexOf(breakpoint);
    }
    
    /**
     * Execute function based on device type
     */
    onDevice(config) {
        if (this.isMobile && config.mobile) {
            config.mobile();
        } else if (this.isTablet && config.tablet) {
            config.tablet();
        } else if (this.isDesktop && config.desktop) {
            config.desktop();
        }
        
        if (config.all) {
            config.all();
        }
    }
    
    /**
     * Device change callback
     */
    onDeviceChange(previousDevice, currentDevice) {
        console.log(`Device changed from ${previousDevice} to ${currentDevice}`);
        
        // Re-optimize for new device
        this.optimizeForDevice();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('devicechange', {
            detail: { previousDevice, currentDevice }
        }));
    }
    
    /**
     * Show/hide elements based on device
     */
    showOnDevice(selector, devices) {
        const elements = document.querySelectorAll(selector);
        const shouldShow = devices.includes(this.currentDevice);
        
        elements.forEach(element => {
            element.style.display = shouldShow ? '' : 'none';
        });
    }
    
    /**
     * Lazy load images based on device
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Choose appropriate image based on device
                    let src = img.dataset.src;
                    if (this.isMobile && img.dataset.srcMobile) {
                        src = img.dataset.srcMobile;
                    } else if (this.isTablet && img.dataset.srcTablet) {
                        src = img.dataset.srcTablet;
                    }
                    
                    img.src = src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileFirst = new MobileFirstUtils();
    
    // Add CSS custom properties for device detection
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --hover-enabled: 1;
        }
        
        .touching {
            opacity: 0.7;
            transform: scale(0.98);
            transition: all 0.1s ease;
        }
        
        .mobile-optimized .card:hover {
            transform: none;
        }
        
        .desktop-optimized .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        /* Device-specific utilities */
        .device-mobile .desktop-feature { display: none !important; }
        .device-desktop .mobile-feature { display: none !important; }
    `;
    document.head.appendChild(style);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileFirstUtils;
}
