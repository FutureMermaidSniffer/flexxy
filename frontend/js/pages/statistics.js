


class StatisticsPage {
    constructor() {
        this.loadingDuration = 6000; 
        this.notifications = [
            { text: "Searching the database for relevant jobs", icon: "fas fa-search" },
            { text: "Using AI to filter jobs", icon: "fas fa-robot" },
            { text: "Pairing jobs...", icon: "fas fa-handshake" }
        ];
        this.currentNotificationIndex = 0;
        this.init();
    }

    init() {
        
        this.startLoadingSequence();
        
        
        this.setupCTAButton();
        
        
        this.setupJobPopup();
        
        
        this.setupAgentNotification();
        
        
        this.checkRegistrationReturn();
        
        console.log('Statistics page initialized');
    }

    startLoadingSequence() {
        
        this.showNotification(0);
        
        
        const notificationInterval = setInterval(() => {
            this.currentNotificationIndex++;
            
            if (this.currentNotificationIndex < this.notifications.length) {
                this.showNotification(this.currentNotificationIndex);
            } else {
                clearInterval(notificationInterval);
                
                setTimeout(() => {
                    this.hideNotifications();
                    this.showStatistics();
                }, 2000); 
            }
        }, 2000);
    }

    showNotification(index) {
        const notificationContainer = document.getElementById('notificationContainer');
        const notification = document.getElementById('loadingNotification');
        const notificationText = document.getElementById('notificationText');
        const notificationIcon = notification.querySelector('i');
        
        if (notification && notificationText && notificationIcon) {
            
            notification.classList.remove('show');
            
            setTimeout(() => {
                
                const currentNotification = this.notifications[index];
                notificationText.textContent = currentNotification.text;
                notificationIcon.className = `${currentNotification.icon} me-2`;
                
                
                notification.classList.add('show');
            }, index === 0 ? 0 : 300); 
        }
    }

    hideNotifications() {
        const notification = document.getElementById('loadingNotification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    showStatistics() {
        const loadingContainer = document.getElementById('loadingContainer');
        const logoContainer = document.getElementById('logoContainer');
        const statisticsContent = document.getElementById('statisticsContent');

        
        loadingContainer.style.display = 'none';
        
        
        logoContainer.style.display = 'block';
        logoContainer.style.animation = 'fadeIn 0.8s ease-in';
        
        
        setTimeout(() => {
            statisticsContent.style.display = 'block';
            statisticsContent.style.animation = 'slideUp 0.8s ease-out';
            
            
            this.animateNumbers();
            
            
            setTimeout(() => {
                this.showJobPopup();
            }, 2000);
            
            
            this.trackStatisticsView();
        }, 500);
    }

    showJobPopup() {
        const jobPopup = document.getElementById('jobPopupOverlay');
        if (jobPopup) {
            jobPopup.classList.add('show');
        }
    }

    hideJobPopup() {
        const jobPopup = document.getElementById('jobPopupOverlay');
        if (jobPopup) {
            jobPopup.classList.remove('show');
        }
    }

    setupJobPopup() {
        const closePopupBtn = document.getElementById('closeJobPopup');
        const applyJobBtn = document.getElementById('applyJobBtn');
        const popupOverlay = document.getElementById('jobPopupOverlay');

        
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                this.hideJobPopup();
            });
        }

        
        if (popupOverlay) {
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) {
                    this.hideJobPopup();
                }
            });
        }

        
        if (applyJobBtn) {
            applyJobBtn.addEventListener('click', () => {
                
                localStorage.setItem('showAgentNotification', 'true');
                localStorage.setItem('jobAppliedFor', 'PEA - CDOT Database');
                
                
                window.location.href = 'registration.html';
            });
        }

        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideJobPopup();
            }
        });
    }
    
    async processWizardCompletion() {
        
        const wizardData = this.collectWizardData();
        
        
        if (wizardData && Object.keys(wizardData).length > 0) {
            try {
                await this.createUserAccount(wizardData);
            } catch (error) {
                console.error('Error creating user account:', error);
                
            }
        }
    }
    
    collectWizardData() {
        const data = {};
        
        
        const workType = localStorage.getItem('workType');
        if (workType) {
            data.workType = JSON.parse(workType);
        }
        
        
        const salaryPreference = localStorage.getItem('salaryPreference');
        if (salaryPreference) {
            data.salaryPreference = JSON.parse(salaryPreference);
        }
        
        
        const locationPreference = localStorage.getItem('locationPreference');
        if (locationPreference) {
            data.locationPreference = JSON.parse(locationPreference);
        }
        
        
        const jobPreference = localStorage.getItem('jobTitlePreference');
        if (jobPreference) {
            data.jobPreference = JSON.parse(jobPreference);
        }
        
        
        const experienceLevel = localStorage.getItem('experienceLevel');
        if (experienceLevel) {
            data.experienceLevel = JSON.parse(experienceLevel);
        }
        
        
        const educationLevel = localStorage.getItem('educationLevel');
        if (educationLevel) {
            data.educationLevel = JSON.parse(educationLevel);
        }
        
        
        const benefitPreference = localStorage.getItem('benefitPreference');
        if (benefitPreference) {
            data.benefitPreference = JSON.parse(benefitPreference);
        }
        
        return data;
    }
    
    async createUserAccount(wizardData) {
        
        const userData = {
            email: `user_${Date.now()}@temp.flexjobs.com`, 
            password: 'temp_password_123', 
            user_type: 'job_seeker',
            preferences: wizardData,
            is_temp_account: true,
            created_via_wizard: true
        };
        
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            
            if (result.token) {
                localStorage.setItem('flexjobs_token', result.token);
                localStorage.setItem('flexjobs_user', JSON.stringify(result.user));
                console.log('Temporary user account created successfully');
                
                
                this.clearWizardData();
            }
        } else {
            throw new Error('Failed to create user account');
        }
    }
    
    clearWizardData() {
        
        const wizardKeys = [
            'workType',
            'salaryPreference', 
            'locationPreference',
            'jobTitlePreference',
            'experienceLevel',
            'educationLevel',
            'benefitPreference'
        ];
        
        wizardKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Wizard data cleared from localStorage');
    }

    checkRegistrationReturn() {
        
        const showAgentNotification = localStorage.getItem('showAgentNotification');
        if (showAgentNotification === 'true') {
            
            localStorage.removeItem('showAgentNotification');
            
            
            setTimeout(() => {
                this.showAgentNotification();
            }, 1000);
        }
        
        
        const intendedJobId = localStorage.getItem('intended_job_id');
        if (intendedJobId) {
            
            localStorage.removeItem('intended_job_id');
            
            
            setTimeout(() => {
                
                const notification = document.getElementById('loadingNotification');
                if (notification) {
                    notification.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                            <h4>Welcome! Redirecting to your job...</h4>
                            <p class="text-muted">Taking you back to the job details</p>
                        </div>
                    `;
                }
                
                
                setTimeout(() => {
                    window.location.href = `job-details.html?id=${intendedJobId}`;
                }, 2000);
            }, this.loadingDuration + 1000); 
        }
    }

    showAgentNotification() {
        const agentNotification = document.getElementById('agentNotification');
        if (agentNotification) {
            agentNotification.classList.add('show');
            
            
            setTimeout(() => {
                this.hideAgentNotification();
            }, 8000);
        }
    }

    hideAgentNotification() {
        const agentNotification = document.getElementById('agentNotification');
        if (agentNotification) {
            agentNotification.classList.remove('show');
        }
    }

    setupAgentNotification() {
        const closeNotificationBtn = document.getElementById('closeAgentNotification');
        
        if (closeNotificationBtn) {
            closeNotificationBtn.addEventListener('click', () => {
                this.hideAgentNotification();
            });
        }
    }

    animateNumbers() {
        
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        
        statNumbers.forEach((element, index) => {
            const target = parseInt(element.getAttribute('data-target'));
            const delay = index * 300; 
            
            setTimeout(() => {
                this.animateCounter(element, 0, target, 2000);
            }, delay);
        });
    }

    animateCounter(element, start, end, duration) {
        if (!element) return;

        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            
            if (end >= 7000000) {
                
                if (progress >= 0.8) {
                    element.textContent = '7,000,000 +';
                } else {
                    element.textContent = this.formatNumber(current);
                }
            } else {
                element.textContent = this.formatNumber(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    setupCTAButton() {
        const ctaButton = document.getElementById('ctaButton');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.handleCTAClick();
            });
        }
    }

    async handleCTAClick() {
        
        this.trackCTAClick();
        
        
        const ctaButton = document.getElementById('ctaButton');
        const originalText = ctaButton.innerHTML;
        
        ctaButton.innerHTML = '<i class="fas fa-search me-2"></i>Creating Your Account...';
        ctaButton.disabled = true;
        
        try {
            
            await this.processWizardCompletion();
            
            
            this.showAccountCreatedNotification();
            
            
            ctaButton.innerHTML = '<i class="fas fa-search me-2"></i>Finding Your Matches...';
            
            
            this.storeProgress();
            
            
            setTimeout(() => {
                window.location.href = 'job-preview.html';
            }, 2000); 
            
        } catch (error) {
            console.error('Error creating account:', error);
            
            
            ctaButton.innerHTML = originalText;
            ctaButton.disabled = false;
            
            
            alert('There was an error creating your account. Please try again.');
        }
    }

    storeProgress() {
        const progress = {
            completedWizard: true,
            statisticsViewed: true,
            timestamp: Date.now()
        };
        
        
        
        const jobPreferences = {
            category: localStorage.getItem('selectedJobCategory') || 'Technology',
            location: localStorage.getItem('selectedLocation') || 'Remote',
            schedule: localStorage.getItem('selectedSchedule') || 'Full-time',
            experience: localStorage.getItem('selectedExperience') || 'Mid-level',
            source: 'statistics_page',
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('flexjobs_wizard_progress', JSON.stringify(progress));
            localStorage.setItem('userJobPreferences', JSON.stringify(jobPreferences));
            console.log('Wizard progress and job preferences saved');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    showAccountCreatedNotification() {
        
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed';
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-check-circle text-success me-2"></i>
                <div>
                    <strong>Welcome!</strong><br>
                    <small>Your account has been created successfully.</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    
    trackStatisticsView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'statistics_viewed', {
                page: 'statistics',
                engagement_time: Date.now()
            });
        }
        
        console.log('Statistics page viewed');
    }

    trackCTAClick() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_clicked', {
                page: 'statistics',
                button: 'see_job_matches'
            });
        }
        
        console.log('CTA button clicked');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.statisticsPageInstance = new StatisticsPage();
});


window.StatisticsPage = StatisticsPage;
