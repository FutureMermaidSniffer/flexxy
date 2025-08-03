

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
        
        
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        document.body.classList.add(`device-${this.currentDevice}`);
        
        
        document.body.setAttribute('data-device', this.currentDevice);
    }
    
    
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
    
    
    setupTouchEvents() {
        if (this.isTouchDevice()) {
            document.body.classList.add('touch-device');
            
            
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
    
    
    optimizeForDevice() {
        if (this.isMobile) {
            this.optimizeForMobile();
        } else if (this.isTablet) {
            this.optimizeForTablet();
        } else {
            this.optimizeForDesktop();
        }
    }
    
    
    optimizeForMobile() {
        
        document.documentElement.style.setProperty('--hover-enabled', '0');
        
        
        document.body.classList.add('mobile-optimized');
        
        
        this.optimizeMobileForms();
        
        
        this.setupMobileNavigation();
    }
    
    
    optimizeForTablet() {
        document.documentElement.style.setProperty('--hover-enabled', '0.5');
        document.body.classList.add('tablet-optimized');
    }
    
    
    optimizeForDesktop() {
        
        document.documentElement.style.setProperty('--hover-enabled', '1');
        document.body.classList.add('desktop-optimized');
        
        
        this.setupKeyboardNavigation();
        
        
        this.enableTooltips();
    }
    
    
    optimizeMobileForms() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            
            if (parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
            
            
            input.setAttribute('autocomplete', 'on');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
        });
    }
    
    
    setupMobileNavigation() {
        const navToggle = document.querySelector('.navbar-toggler');
        const navCollapse = document.querySelector('.navbar-collapse');
        
        if (navToggle && navCollapse) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                
                
                if (isExpanded) {
                    navCollapse.classList.add('collapsing');
                    setTimeout(() => {
                        navCollapse.classList.remove('collapsing');
                    }, 300);
                }
            });
        }
    }
    
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modalInstance = bootstrap.Modal.getInstance(openModal);
                    modalInstance?.hide();
                }
            }
            
            
            if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
                const form = e.target.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
                    submitBtn?.click();
                }
            }
        });
    }
    
    
    enableTooltips() {
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach(element => {
            new bootstrap.Tooltip(element);
        });
    }
    
    
    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.desktopXL) return 'desktopXL';
        if (width >= this.breakpoints.desktopLarge) return 'desktopLarge';
        if (width >= this.breakpoints.desktop) return 'desktop';
        if (width >= this.breakpoints.tablet) return 'tablet';
        if (width >= this.breakpoints.mobileLarge) return 'mobileLarge';
        return 'mobile';
    }
    
    
    isBreakpoint(breakpoint) {
        return this.getCurrentBreakpoint() === breakpoint;
    }
    
    
    isBreakpointUp(breakpoint) {
        const current = this.getCurrentBreakpoint();
        const breakpointOrder = ['mobile', 'mobileLarge', 'tablet', 'desktop', 'desktopLarge', 'desktopXL'];
        
        return breakpointOrder.indexOf(current) >= breakpointOrder.indexOf(breakpoint);
    }
    
    
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
    
    
    onDeviceChange(previousDevice, currentDevice) {
        console.log(`Device changed from ${previousDevice} to ${currentDevice}`);
        
        
        this.optimizeForDevice();
        
        
        window.dispatchEvent(new CustomEvent('devicechange', {
            detail: { previousDevice, currentDevice }
        }));
    }
    
    
    showOnDevice(selector, devices) {
        const elements = document.querySelectorAll(selector);
        const shouldShow = devices.includes(this.currentDevice);
        
        elements.forEach(element => {
            element.style.display = shouldShow ? '' : 'none';
        });
    }
    
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    
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


document.addEventListener('DOMContentLoaded', () => {
    window.mobileFirst = new MobileFirstUtils();
    
    
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
        
        
        .device-mobile .desktop-feature { display: none !important; }
        .device-desktop .mobile-feature { display: none !important; }
    `;
    document.head.appendChild(style);
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileFirstUtils;
}
