

class FooterComponent {
    constructor() {
        this.isInitialized = false;
        this.accordionState = new Map();
        this.backToTopButton = null;
        this.newsletterForm = null;
        this.socialLinks = [];
        
        
        this.throttle = this.createThrottle();
        this.debounce = this.createDebounce();
        
        this.init();
    }

    
    init() {
        if (this.isInitialized) return;
        
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFooter());
        } else {
            this.setupFooter();
        }
    }

    
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

    
    setupMobileAccordion() {
        const accordionHeaders = document.querySelectorAll('.mobile-footer__section-header');
        
        accordionHeaders.forEach((header, index) => {
            const sectionId = `footer-section-${index}`;
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.mobile-footer__chevron');
            
            
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', sectionId);
            content.setAttribute('id', sectionId);
            content.style.maxHeight = '0';
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.3s ease-out, padding 0.3s ease-out';
            
            
            this.accordionState.set(sectionId, false);
            
            
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAccordionSection(header, content, chevron, sectionId);
            });
            
            
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordionSection(header, content, chevron, sectionId);
                }
            });
        });
    }

    
    toggleAccordionSection(header, content, chevron, sectionId) {
        const isExpanded = this.accordionState.get(sectionId);
        
        if (isExpanded) {
            
            content.style.maxHeight = '0';
            content.style.paddingBottom = '0';
            header.setAttribute('aria-expanded', 'false');
            chevron.style.transform = 'rotate(0deg)';
            this.accordionState.set(sectionId, false);
        } else {
            
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.paddingBottom = '1rem';
            header.setAttribute('aria-expanded', 'true');
            chevron.style.transform = 'rotate(180deg)';
            this.accordionState.set(sectionId, true);
            
            
            if (window.innerWidth < 576) {
                this.collapseOtherSections(sectionId);
            }
        }
        
        
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    
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

    
    setupNewsletterForm() {
        this.newsletterForm = document.querySelector('.mobile-footer__newsletter-form, .pc-footer__newsletter-form');
        
        if (!this.newsletterForm) return;
        
        const emailInput = this.newsletterForm.querySelector('input[type="email"]');
        const submitButton = this.newsletterForm.querySelector('button[type="submit"]');
        
        
        emailInput?.addEventListener('input', this.debounce((e) => {
            this.validateEmail(e.target);
        }, 300));
        
        
        this.newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (emailInput && submitButton) {
                await this.handleNewsletterSubmission(emailInput, submitButton);
            }
        });
        
        
        emailInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.newsletterForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    
    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        
        input.classList.remove('is-valid', 'is-invalid');
        
        if (email && isValid) {
            input.classList.add('is-valid');
        } else if (email && !isValid) {
            input.classList.add('is-invalid');
        }
        
        return isValid;
    }

    
    async handleNewsletterSubmission(emailInput, submitButton) {
        const email = emailInput.value.trim();
        
        if (!this.validateEmail(emailInput)) {
            this.showNotification('Please enter a valid email address', 'error');
            emailInput.focus();
            return;
        }
        
        
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = '';
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            
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
                
                
                this.trackEvent('newsletter_subscription', { email });
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNotification('Subscription failed. Please try again.', 'error');
        } finally {
            
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    
    setupSocialLinks() {
        this.socialLinks = document.querySelectorAll('.mobile-footer__social-link, .pc-footer__social-link');
        
        this.socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.extractSocialPlatform(link.href);
                
                
                this.trackEvent('social_media_click', { platform });
                
                
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
            
            
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }

    
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

    
    setupBackToTop() {
        
        if (!document.querySelector('.back-to-top')) {
            this.createBackToTopButton();
        }
        
        this.backToTopButton = document.querySelector('.back-to-top');
        
        if (!this.backToTopButton) return;
        
        
        this.backToTopButton.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        
        this.backToTopButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }

    
    createBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(button);
    }

    
    scrollToTop() {
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        const duration = 600;
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition * (1 - easeOut));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
        
        
        this.trackEvent('scroll_to_top');
        
        
        if ('vibrate' in navigator) {
            navigator.vibrate(25);
        }
    }

    
    setupScrollListeners() {
        const scrollHandler = this.throttle(() => {
            this.handleScroll();
        }, 100);
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    
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
        
        
        this.updateScrollProgress(scrollTop);
    }

    
    updateScrollProgress(scrollTop) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const progress = scrollTop / (documentHeight - windowHeight);
        
        
        window.dispatchEvent(new CustomEvent('footerScrollProgress', {
            detail: { progress, scrollTop }
        }));
    }

    
    setupResizeListener() {
        const resizeHandler = this.debounce(() => {
            this.handleResize();
        }, 250);
        
        window.addEventListener('resize', resizeHandler);
    }

    
    handleResize() {
        const width = window.innerWidth;
        
        
        if (width >= 992) {
            
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
        
        
        window.dispatchEvent(new CustomEvent('footerResize', {
            detail: { width, height: window.innerHeight }
        }));
    }

    
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

    
    showNotification(message, type = 'info') {
        
        if (window.auth && typeof window.auth.showAlert === 'function') {
            const alertType = type === 'error' ? 'danger' : type;
            window.auth.showAlert(message, alertType);
            return;
        }
        
        
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

    
    trackEvent(eventName, properties = {}) {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(eventName, properties);
        }
        
        
        console.log('Footer Event:', eventName, properties);
    }

    
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

    
    destroy() {
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        
        this.accordionState.clear();
        
        
        if (this.backToTopButton) {
            this.backToTopButton.remove();
        }
        
        this.isInitialized = false;
        console.log('Footer component destroyed');
    }
}


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


let footerInstance = null;


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        footerInstance = new FooterComponent();
    });
} else {
    footerInstance = new FooterComponent();
}


window.FooterComponent = FooterComponent;
window.footerInstance = footerInstance;


if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    
    module.hot.dispose(() => {
        if (footerInstance) {
            footerInstance.destroy();
        }
    });
}
