// Job Preview Page JavaScript
class JobPreview {
    constructor() {
        this.userPreferences = {};
        this.init();
    }

    init() {
        // Get user preferences from localStorage or URL params
        this.loadUserPreferences();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Animate page elements
        this.animateElements();
        
        // Track page view
        this.trackPageView();
    }

    loadUserPreferences() {
        // Try to get preferences from localStorage (from previous quiz/form steps)
        const savedPreferences = localStorage.getItem('userJobPreferences');
        if (savedPreferences) {
            this.userPreferences = JSON.parse(savedPreferences);
        }

        // Also check URL parameters for any passed data
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

        // Update the page content based on preferences
        this.updateContentBasedOnPreferences();
    }

    updateContentBasedOnPreferences() {
        // Update job count based on preferences
        const matchCountElement = document.querySelector('.match-count strong');
        if (matchCountElement) {
            // Generate a realistic number based on preferences
            let jobCount = this.calculateJobCount();
            matchCountElement.textContent = `${jobCount.toLocaleString()} jobs`;
        }

        // Update title and subtitle if specific preferences are known
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
        // Base number of jobs
        let baseCount = 1247;
        
        // Adjust based on preferences (simulate filtering)
        if (this.userPreferences.category) {
            switch (this.userPreferences.category.toLowerCase()) {
                case 'technology':
                case 'software':
                case 'it':
                    baseCount = Math.floor(Math.random() * 500) + 800; // 800-1300
                    break;
                case 'marketing':
                case 'digital marketing':
                    baseCount = Math.floor(Math.random() * 300) + 400; // 400-700
                    break;
                case 'design':
                case 'creative':
                    baseCount = Math.floor(Math.random() * 200) + 250; // 250-450
                    break;
                case 'finance':
                case 'accounting':
                    baseCount = Math.floor(Math.random() * 400) + 300; // 300-700
                    break;
                case 'education':
                case 'training':
                    baseCount = Math.floor(Math.random() * 350) + 200; // 200-550
                    break;
                case 'healthcare':
                case 'medical':
                    baseCount = Math.floor(Math.random() * 600) + 400; // 400-1000
                    break;
                case 'customer service':
                case 'support':
                    baseCount = Math.floor(Math.random() * 800) + 600; // 600-1400
                    break;
                default:
                    baseCount = Math.floor(Math.random() * 400) + 500; // 500-900
            }
        }

        // Adjust for location preference
        if (this.userPreferences.location) {
            if (this.userPreferences.location.toLowerCase().includes('remote')) {
                baseCount = Math.floor(baseCount * 1.2); // 20% more remote jobs
            } else if (this.userPreferences.location.toLowerCase() !== 'anywhere') {
                baseCount = Math.floor(baseCount * 0.7); // Fewer location-specific jobs
            }
        }

        // Adjust for schedule preference
        if (this.userPreferences.schedule) {
            if (this.userPreferences.schedule.toLowerCase().includes('part')) {
                baseCount = Math.floor(baseCount * 0.6); // Fewer part-time jobs
            } else if (this.userPreferences.schedule.toLowerCase().includes('freelance')) {
                baseCount = Math.floor(baseCount * 0.8); // Fewer freelance jobs
            }
        }

        return Math.max(baseCount, 150); // Minimum of 150 jobs
    }

    setupEventListeners() {
        // Register button click
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.handleRegistration();
            });
        }

        // Back button click
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.handleBack();
            });
        }

        // Job card clicks (for preview/teaser effect)
        const jobCards = document.querySelectorAll('.job-card');
        jobCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.handleJobCardClick(index);
            });
        });

        // Track scroll behavior
        this.setupScrollTracking();
    }

    handleRegistration() {
        // Store that user came from job preview
        localStorage.setItem('cameFromJobPreview', 'true');
        localStorage.setItem('viewedJobPreviewTime', new Date().toISOString());
        
        // Track conversion event
        this.trackEvent('job_preview_registration_click', {
            source: 'job_preview_page',
            preferences: this.userPreferences
        });

        // Redirect to registration page
        window.location.href = 'registration.html';
    }

    handleBack() {
        // Track back button usage
        this.trackEvent('job_preview_back_click', {
            time_on_page: this.getTimeOnPage()
        });

        // Go back to previous page or quiz
        if (document.referrer && document.referrer.includes(window.location.origin)) {
            window.history.back();
        } else {
            // Default fallback - go to home page or quiz start
            window.location.href = 'what-job.html';
        }
    }

    handleJobCardClick(cardIndex) {
        // Show teaser message for non-registered users
        this.showJobCardTeaser(cardIndex);
        
        // Track job card interaction
        this.trackEvent('job_preview_card_click', {
            card_index: cardIndex,
            card_position: `card_${cardIndex + 1}`
        });
    }

    showJobCardTeaser(cardIndex) {
        // Create a subtle notification
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

        // Style the notification
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

        // Add animation keyframes if not already present
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

        // Remove notification after 5 seconds
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
        // Add entrance animations to various elements
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

        // Initial animation trigger
        setTimeout(animateOnScroll, 100);
        
        // Animation on scroll
        window.addEventListener('scroll', animateOnScroll);
    }

    setupScrollTracking() {
        let maxScroll = 0;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Set new timeout to track scroll completion
            scrollTimeout = setTimeout(() => {
                this.trackEvent('job_preview_scroll', {
                    max_scroll_percent: maxScroll,
                    current_scroll_percent: scrollPercent
                });
            }, 1000); // Track after 1 second of no scrolling
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
        // Google Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...eventData,
                page_path: window.location.pathname
            });
        }

        // Console log for development
        console.log('Event tracked:', eventName, eventData);

        // Store in localStorage for internal analytics
        const analyticsData = JSON.parse(localStorage.getItem('jobPreviewAnalytics') || '[]');
        analyticsData.push({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            page: 'job-preview'
        });
        
        // Keep only last 50 events
        if (analyticsData.length > 50) {
            analyticsData.splice(0, analyticsData.length - 50);
        }
        
        localStorage.setItem('jobPreviewAnalytics', JSON.stringify(analyticsData));
    }

    // Public method to update job count dynamically
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

    // Public method to customize page content
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

// Initialize the job preview when the page loads
let jobPreview;
document.addEventListener('DOMContentLoaded', () => {
    jobPreview = new JobPreview();
    
    // Example of how to customize the page (can be called from external scripts)
    // jobPreview.customize({
    //     title: 'Amazing Tech Jobs Found!',
    //     jobCount: 856,
    //     ctaText: 'Start Applying Today'
    // });
});
