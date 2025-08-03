/**
 * Footer Component JavaScript
 * Handles mobile accordion functionality, newsletter signup, social interactions,
 * back-to-top button, and responsive behavior
 */

class FooterComponent {
    constructor() {
        this.isInitialized = false;
        this.accordionState = new Map();
        this.backToTopButton = null;
        this.newsletterForm = null;
        this.socialLinks = [];
        
        // Throttle and debounce utilities
        this.throttle = this.createThrottle();
        this.debounce = this.createDebounce();
        
        this.init();
    }

    /**
     * Initialize the footer component
     */
    init() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFooter());
        } else {
            this.setupFooter();
        }
    }

    /**
     * Setup all footer functionality
     */
    setupFooter() {
        this.setupMobileAccordion();
        this.setupNewsletterForm();
        this.setupSocialLinks();
        this.setupBackToTop();
        this.setupScrollListeners();
        this.setupResizeListener();
        this.setupLazyLoading();
        
        this.isInitialized = true;
        console.log('Footer component initialized');
    }

    /**
     * Setup mobile accordion functionality
     */
    setupMobileAccordion() {
        const accordionHeaders = document.querySelectorAll('.mobile-footer__section-header');
        
        accordionHeaders.forEach((header, index) => {
            const sectionId = `footer-section-${index}`;
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.mobile-footer__chevron');
            
            // Set initial ARIA attributes
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', sectionId);
            content.setAttribute('id', sectionId);
            content.style.maxHeight = '0';
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.3s ease-out, padding 0.3s ease-out';
            
            // Initialize state
            this.accordionState.set(sectionId, false);
            
            // Add click listener
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAccordionSection(header, content, chevron, sectionId);
            });
            
            // Add keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordionSection(header, content, chevron, sectionId);
                }
            });
        });
    }

    /**
     * Toggle accordion section
     */
    toggleAccordionSection(header, content, chevron, sectionId) {
        const isExpanded = this.accordionState.get(sectionId);
        
        if (isExpanded) {
            // Collapse
            content.style.maxHeight = '0';
            content.style.paddingBottom = '0';
            header.setAttribute('aria-expanded', 'false');
            chevron.style.transform = 'rotate(0deg)';
            this.accordionState.set(sectionId, false);
        } else {
            // Expand
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.paddingBottom = '1rem';
            header.setAttribute('aria-expanded', 'true');
            chevron.style.transform = 'rotate(180deg)';
            this.accordionState.set(sectionId, true);
            
            // Auto-collapse other sections if on small screens
            if (window.innerWidth < 576) {
                this.collapseOtherSections(sectionId);
            }
        }
        
        // Add haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    /**
     * Collapse other accordion sections
     */
    collapseOtherSections(currentSectionId) {
        this.accordionState.forEach((isExpanded, sectionId) => {
            if (sectionId !== currentSectionId && isExpanded) {
                const header = document.querySelector(`[aria-controls="${sectionId}"]`);
                const content = document.getElementById(sectionId);
                const chevron = header?.querySelector('.mobile-footer__chevron');
                
                if (header && content && chevron) {
                    content.style.maxHeight = '0';
                    content.style.paddingBottom = '0';
                    header.setAttribute('aria-expanded', 'false');
                    chevron.style.transform = 'rotate(0deg)';
                    this.accordionState.set(sectionId, false);
                }
            }
        });
    }

    /**
     * Setup newsletter form functionality
     */
    setupNewsletterForm() {
        this.newsletterForm = document.querySelector('.mobile-footer__newsletter-form, .pc-footer__newsletter-form');
        
        if (!this.newsletterForm) return;
        
        const emailInput = this.newsletterForm.querySelector('input[type="email"]');
        const submitButton = this.newsletterForm.querySelector('button[type="submit"]');
        
        // Enhanced email validation
        emailInput?.addEventListener('input', this.debounce((e) => {
            this.validateEmail(e.target);
        }, 300));
        
        // Form submission
        this.newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (emailInput && submitButton) {
                await this.handleNewsletterSubmission(emailInput, submitButton);
            }
        });
        
        // Keyboard shortcuts
        emailInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.newsletterForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    /**
     * Validate email input
     */
    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        // Remove existing validation classes
        input.classList.remove('is-valid', 'is-invalid');
        
        if (email && isValid) {
            input.classList.add('is-valid');
        } else if (email && !isValid) {
            input.classList.add('is-invalid');
        }
        
        return isValid;
    }

    /**
     * Handle newsletter form submission
     */
    async handleNewsletterSubmission(emailInput, submitButton) {
        const email = emailInput.value.trim();
        
        if (!this.validateEmail(emailInput)) {
            this.showNotification('Please enter a valid email address', 'error');
            emailInput.focus();
            return;
        }
        
        // Show loading state
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = '';
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                this.showNotification('Successfully subscribed to newsletter!', 'success');
                emailInput.value = '';
                emailInput.classList.remove('is-valid');
                
                // Track subscription event
                this.trackEvent('newsletter_subscription', { email });
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNotification('Subscription failed. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    /**
     * Setup social media links with analytics tracking
     */
    setupSocialLinks() {
        this.socialLinks = document.querySelectorAll('.mobile-footer__social-link, .pc-footer__social-link');
        
        this.socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.extractSocialPlatform(link.href);
                
                // Track social media click
                this.trackEvent('social_media_click', { platform });
                
                // Add visual feedback
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
            
            // Keyboard support
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }

    /**
     * Extract social media platform from URL
     */
    extractSocialPlatform(url) {
        const platforms = {
            'facebook.com': 'facebook',
            'twitter.com': 'twitter',
            'x.com': 'twitter',
            'linkedin.com': 'linkedin',
            'instagram.com': 'instagram',
            'youtube.com': 'youtube',
            'tiktok.com': 'tiktok'
        };
        
        for (const [domain, platform] of Object.entries(platforms)) {
            if (url.includes(domain)) {
                return platform;
            }
        }
        
        return 'unknown';
    }

    /**
     * Setup back-to-top button functionality
     */
    setupBackToTop() {
        // Create back-to-top button if it doesn't exist
        if (!document.querySelector('.back-to-top')) {
            this.createBackToTopButton();
        }
        
        this.backToTopButton = document.querySelector('.back-to-top');
        
        if (!this.backToTopButton) return;
        
        // Click handler
        this.backToTopButton.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        // Keyboard support
        this.backToTopButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }

    /**
     * Create back-to-top button
     */
    createBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(button);
    }

    /**
     * Smooth scroll to top
     */
    scrollToTop() {
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        const duration = 600;
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition * (1 - easeOut));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
        
        // Track scroll to top event
        this.trackEvent('scroll_to_top');
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(25);
        }
    }

    /**
     * Setup scroll listeners for back-to-top button visibility
     */
    setupScrollListeners() {
        const scrollHandler = this.throttle(() => {
            this.handleScroll();
        }, 100);
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const showThreshold = 300;
        
        if (this.backToTopButton) {
            if (scrollTop > showThreshold) {
                this.backToTopButton.classList.add('visible');
            } else {
                this.backToTopButton.classList.remove('visible');
            }
        }
        
        // Update progress for any scroll-based animations
        this.updateScrollProgress(scrollTop);
    }

    /**
     * Update scroll progress for animations
     */
    updateScrollProgress(scrollTop) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const progress = scrollTop / (documentHeight - windowHeight);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('footerScrollProgress', {
            detail: { progress, scrollTop }
        }));
    }

    /**
     * Setup window resize listener
     */
    setupResizeListener() {
        const resizeHandler = this.debounce(() => {
            this.handleResize();
        }, 250);
        
        window.addEventListener('resize', resizeHandler);
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        const width = window.innerWidth;
        
        // Reset accordion states on mobile/desktop transitions
        if (width >= 992) {
            // Desktop: collapse all mobile accordions
            this.accordionState.forEach((_, sectionId) => {
                const content = document.getElementById(sectionId);
                const header = document.querySelector(`[aria-controls="${sectionId}"]`);
                const chevron = header?.querySelector('.mobile-footer__chevron');
                
                if (content && header && chevron) {
                    content.style.maxHeight = '';
                    content.style.paddingBottom = '';
                    header.setAttribute('aria-expanded', 'false');
                    chevron.style.transform = 'rotate(0deg)';
                    this.accordionState.set(sectionId, false);
                }
            });
        }
        
        // Dispatch resize event for other components
        window.dispatchEvent(new CustomEvent('footerResize', {
            detail: { width, height: window.innerHeight }
        }));
    }

    /**
     * Setup lazy loading for footer images
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('.pc-footer__app-button img, .mobile-footer__logo, .pc-footer__logo');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            images.forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Check if auth component is available for notifications
        if (window.auth && typeof window.auth.showAlert === 'function') {
            const alertType = type === 'error' ? 'danger' : type;
            window.auth.showAlert(message, alertType);
            return;
        }
        
        // Fallback: create simple notification
        const notification = document.createElement('div');
        notification.className = `footer-notification footer-notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Track analytics events
     */
    trackEvent(eventName, properties = {}) {
        // Send to analytics service (Google Analytics, Mixpanel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(eventName, properties);
        }
        
        // Console log for development
        console.log('Footer Event:', eventName, properties);
    }

    /**
     * Create throttle utility
     */
    createThrottle() {
        return (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };
    }

    /**
     * Create debounce utility
     */
    createDebounce() {
        return (func, delay) => {
            let timeoutId;
            return function() {
                const args = arguments;
                const context = this;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(context, args), delay);
            };
        };
    }

    /**
     * Public API for external components
     */
    expandAccordionSection(sectionIndex) {
        const header = document.querySelectorAll('.mobile-footer__section-header')[sectionIndex];
        if (header && !this.accordionState.get(header.getAttribute('aria-controls'))) {
            header.click();
        }
    }

    collapseAllAccordions() {
        this.accordionState.forEach((isExpanded, sectionId) => {
            if (isExpanded) {
                const header = document.querySelector(`[aria-controls="${sectionId}"]`);
                header?.click();
            }
        });
    }

    showBackToTop() {
        if (this.backToTopButton) {
            this.backToTopButton.classList.add('visible');
        }
    }

    hideBackToTop() {
        if (this.backToTopButton) {
            this.backToTopButton.classList.remove('visible');
        }
    }

    /**
     * Cleanup component
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        // Clear accordions
        this.accordionState.clear();
        
        // Remove back-to-top button
        if (this.backToTopButton) {
            this.backToTopButton.remove();
        }
        
        this.isInitialized = false;
        console.log('Footer component destroyed');
    }
}

// CSS for notifications (injected if not present)
if (!document.querySelector('#footer-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'footer-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-initialize footer component
let footerInstance = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        footerInstance = new FooterComponent();
    });
} else {
    footerInstance = new FooterComponent();
}

// Export for manual initialization if needed
window.FooterComponent = FooterComponent;
window.footerInstance = footerInstance;

// Hot module replacement support for development
if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    
    module.hot.dispose(() => {
        if (footerInstance) {
            footerInstance.destroy();
        }
    });
}
