
class JobPreview {
    constructor() {
        this.userPreferences = {};
        this.init();
    }

    init() {
        
        this.loadUserPreferences();
        
        
        this.setupEventListeners();
        
        
        this.animateElements();
        
        
        this.trackPageView();
    }

    loadUserPreferences() {
        
        const savedPreferences = localStorage.getItem('userJobPreferences');
        if (savedPreferences) {
            this.userPreferences = JSON.parse(savedPreferences);
        }

        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('category')) {
            this.userPreferences.category = urlParams.get('category');
        }
        if (urlParams.has('location')) {
            this.userPreferences.location = urlParams.get('location');
        }
        if (urlParams.has('schedule')) {
            this.userPreferences.schedule = urlParams.get('schedule');
        }

        
        this.updateContentBasedOnPreferences();
    }

    updateContentBasedOnPreferences() {
        
        const matchCountElement = document.querySelector('.match-count strong');
        if (matchCountElement) {
            
            let jobCount = this.calculateJobCount();
            matchCountElement.textContent = `${jobCount.toLocaleString()} jobs`;
        }

        
        if (this.userPreferences.category) {
            const titleElement = document.querySelector('.preview-title');
            if (titleElement) {
                titleElement.textContent = `Perfect ${this.userPreferences.category} Jobs Found!`;
            }
        }

        if (this.userPreferences.location && this.userPreferences.location !== 'anywhere') {
            const subtitleElement = document.querySelector('.preview-subtitle');
            if (subtitleElement) {
                subtitleElement.textContent = `Based on your preferences for ${this.userPreferences.location}, here are some amazing opportunities waiting for you`;
            }
        }
    }

    calculateJobCount() {
        
        let baseCount = 1247;
        
        
        if (this.userPreferences.category) {
            switch (this.userPreferences.category.toLowerCase()) {
                case 'technology':
                case 'software':
                case 'it':
                    baseCount = Math.floor(Math.random() * 500) + 800; 
                    break;
                case 'marketing':
                case 'digital marketing':
                    baseCount = Math.floor(Math.random() * 300) + 400; 
                    break;
                case 'design':
                case 'creative':
                    baseCount = Math.floor(Math.random() * 200) + 250; 
                    break;
                case 'finance':
                case 'accounting':
                    baseCount = Math.floor(Math.random() * 400) + 300; 
                    break;
                case 'education':
                case 'training':
                    baseCount = Math.floor(Math.random() * 350) + 200; 
                    break;
                case 'healthcare':
                case 'medical':
                    baseCount = Math.floor(Math.random() * 600) + 400; 
                    break;
                case 'customer service':
                case 'support':
                    baseCount = Math.floor(Math.random() * 800) + 600; 
                    break;
                default:
                    baseCount = Math.floor(Math.random() * 400) + 500; 
            }
        }

        
        if (this.userPreferences.location) {
            if (this.userPreferences.location.toLowerCase().includes('remote')) {
                baseCount = Math.floor(baseCount * 1.2); 
            } else if (this.userPreferences.location.toLowerCase() !== 'anywhere') {
                baseCount = Math.floor(baseCount * 0.7); 
            }
        }

        
        if (this.userPreferences.schedule) {
            if (this.userPreferences.schedule.toLowerCase().includes('part')) {
                baseCount = Math.floor(baseCount * 0.6); 
            } else if (this.userPreferences.schedule.toLowerCase().includes('freelance')) {
                baseCount = Math.floor(baseCount * 0.8); 
            }
        }

        return Math.max(baseCount, 150); 
    }

    setupEventListeners() {
        
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.handleRegistration();
            });
        }

        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.handleBack();
            });
        }

        
        const jobCards = document.querySelectorAll('.job-card');
        jobCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.handleJobCardClick(index);
            });
        });

        
        this.setupScrollTracking();
    }

    handleRegistration() {
        
        localStorage.setItem('cameFromJobPreview', 'true');
        localStorage.setItem('viewedJobPreviewTime', new Date().toISOString());
        
        
        this.trackEvent('job_preview_registration_click', {
            source: 'job_preview_page',
            preferences: this.userPreferences
        });

        
        window.location.href = 'registration.html';
    }

    handleBack() {
        
        this.trackEvent('job_preview_back_click', {
            time_on_page: this.getTimeOnPage()
        });

        
        const wizardProgress = localStorage.getItem('flexjobs_wizard_progress');
        if (wizardProgress) {
            try {
                const progress = JSON.parse(wizardProgress);
                if (progress.completedWizard && progress.statisticsViewed) {
                    
                    window.location.href = 'statistics.html';
                    return;
                }
            } catch (error) {
                console.error('Error parsing wizard progress:', error);
            }
        }

        
        if (document.referrer && document.referrer.includes(window.location.origin)) {
            window.history.back();
        } else {
            
            window.location.href = 'what-job.html';
        }
    }

    handleJobCardClick(cardIndex) {
        
        this.showJobCardTeaser(cardIndex);
        
        
        this.trackEvent('job_preview_card_click', {
            card_index: cardIndex,
            card_position: `card_${cardIndex + 1}`
        });
    }

    showJobCardTeaser(cardIndex) {
        
        const notification = document.createElement('div');
        notification.className = 'job-preview-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-lock me-2"></i>
                <span>Create a free account to view full job details and apply</span>
                <button class="btn btn-sm btn-light ms-2" onclick="jobPreview.handleRegistration()">
                    Sign Up Free
                </button>
            </div>
        `;

        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        
        if (!document.querySelector('#preview-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'preview-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .job-preview-notification .notification-content {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .job-preview-notification .btn-light {
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    font-weight: 600;
                    padding: 0.25rem 0.75rem;
                    border-radius: 15px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    animateElements() {
        
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.job-card, .benefit-item, .more-jobs-indicator');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        
        setTimeout(animateOnScroll, 100);
        
        
        window.addEventListener('scroll', animateOnScroll);
    }

    setupScrollTracking() {
        let maxScroll = 0;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);

            
            clearTimeout(scrollTimeout);

            
            scrollTimeout = setTimeout(() => {
                this.trackEvent('job_preview_scroll', {
                    max_scroll_percent: maxScroll,
                    current_scroll_percent: scrollPercent
                });
            }, 1000); 
        });
    }

    getTimeOnPage() {
        if (this.pageLoadTime) {
            return Date.now() - this.pageLoadTime;
        }
        return 0;
    }

    trackPageView() {
        this.pageLoadTime = Date.now();
        
        this.trackEvent('job_preview_page_view', {
            preferences: this.userPreferences,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    trackEvent(eventName, eventData = {}) {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...eventData,
                page_path: window.location.pathname
            });
        }

        
        console.log('Event tracked:', eventName, eventData);

        
        const analyticsData = JSON.parse(localStorage.getItem('jobPreviewAnalytics') || '[]');
        analyticsData.push({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            page: 'job-preview'
        });
        
        
        if (analyticsData.length > 50) {
            analyticsData.splice(0, analyticsData.length - 50);
        }
        
        localStorage.setItem('jobPreviewAnalytics', JSON.stringify(analyticsData));
    }

    
    updateJobCount(newCount) {
        const matchCountElement = document.querySelector('.match-count strong');
        if (matchCountElement) {
            matchCountElement.textContent = `${newCount.toLocaleString()} jobs`;
        }
        
        const moreJobsElement = document.querySelector('.more-jobs-indicator strong');
        if (moreJobsElement && newCount > 6) {
            moreJobsElement.textContent = `${(newCount - 6).toLocaleString()} more jobs`;
        }
    }

    
    customize(options = {}) {
        if (options.title) {
            const titleElement = document.querySelector('.preview-title');
            if (titleElement) titleElement.textContent = options.title;
        }

        if (options.subtitle) {
            const subtitleElement = document.querySelector('.preview-subtitle');
            if (subtitleElement) subtitleElement.textContent = options.subtitle;
        }

        if (options.jobCount) {
            this.updateJobCount(options.jobCount);
        }

        if (options.ctaText) {
            const ctaButton = document.getElementById('registerBtn');
            if (ctaButton) {
                const icon = ctaButton.querySelector('i');
                ctaButton.innerHTML = icon ? icon.outerHTML + ' ' + options.ctaText : options.ctaText;
            }
        }
    }
}


let jobPreview;
document.addEventListener('DOMContentLoaded', () => {
    jobPreview = new JobPreview();
    
    
    
    
    
    
    
});
