

class MainFooter {
    constructor() {
        this.init();
    }

    init() {
        this.initMobileAccordion();
        this.initBackToTop();
        this.initNewsletterForm();
    }

    
    initMobileAccordion() {
        const accordionHeaders = document.querySelectorAll('.main-footer__mobile-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                
                const target = header.getAttribute('data-bs-target');
                const collapse = document.querySelector(target);
                const chevron = header.querySelector('i');
                
                if (collapse) {
                    const isExpanded = header.getAttribute('aria-expanded') === 'true';
                    
                    
                    this.closeAllAccordions(header);
                    
                    if (!isExpanded) {
                        
                        collapse.classList.add('show');
                        header.setAttribute('aria-expanded', 'true');
                        chevron.style.transform = 'rotate(180deg)';
                    } else {
                        
                        collapse.classList.remove('show');
                        header.setAttribute('aria-expanded', 'false');
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    }

    
    closeAllAccordions(currentHeader) {
        const allHeaders = document.querySelectorAll('.main-footer__mobile-header');
        
        allHeaders.forEach(header => {
            if (header !== currentHeader) {
                const target = header.getAttribute('data-bs-target');
                const collapse = document.querySelector(target);
                const chevron = header.querySelector('i');
                
                if (collapse) {
                    collapse.classList.remove('show');
                    header.setAttribute('aria-expanded', 'false');
                    chevron.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    
    initBackToTop() {
        
        let backToTopBtn = document.getElementById('backToTop');
        
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'backToTop';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(backToTopBtn);
        }

        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    
    initNewsletterForm() {
        const forms = document.querySelectorAll('.main-footer__newsletter-form, .pc-footer__newsletter-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(form);
            });
        });
    }

    
    handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!email) {
            this.showMessage('Please enter your email address.', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;

        
        setTimeout(() => {
            
            emailInput.value = '';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            this.showMessage('Thank you for subscribing! You\'ll receive job alerts soon.', 'success');
        }, 1500);
    }

    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    
    showMessage(message, type) {
        
        const existingMessages = document.querySelectorAll('.footer-message');
        existingMessages.forEach(msg => msg.remove());

        
        const messageDiv = document.createElement('div');
        messageDiv.className = `footer-message alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 14px;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    
    trackSocialClick(platform) {
        
        console.log(`Social media click: ${platform}`);
    }

    
    trackAppDownload(store) {
        
        console.log(`App download click: ${store}`);
    }
}


const backToTopStyles = `
    .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 123, 255, 0.3);
    }
    
    .back-to-top.visible {
        opacity: 1;
        visibility: visible;
    }
    
    .back-to-top:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
    }
    
    .back-to-top i {
        font-size: 16px;
    }
    
    @media (max-width: 768px) {
        .back-to-top {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
        }
    }
`;


const styleSheet = document.createElement('style');
styleSheet.textContent = backToTopStyles;
document.head.appendChild(styleSheet);


document.addEventListener('DOMContentLoaded', () => {
    new MainFooter();
});


document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (!target) return;

    
    if (target.classList.contains('main-footer__social-link') || 
        target.classList.contains('main-footer__mobile-social-link')) {
        const platform = target.querySelector('i').className.match(/fa-(\w+)/)?.[1] || 'unknown';
        console.log(`Social media click: ${platform}`);
    }

    
    if (target.classList.contains('main-footer__app-button') || 
        target.classList.contains('main-footer__mobile-app-button')) {
        const store = target.querySelector('img').alt.toLowerCase().includes('app store') ? 'ios' : 'android';
        console.log(`App download click: ${store}`);
    }
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainFooter;
}
