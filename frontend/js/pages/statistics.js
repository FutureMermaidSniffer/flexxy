// Statistics Page JavaScript
// Handles the loading animation and statistics display

class StatisticsPage {
    constructor() {
        this.loadingDuration = 6000; // 6 seconds total (3 notifications × 2 seconds each)
        this.notifications = [
            { text: "Searching the database for relevant jobs", icon: "fas fa-search" },
            { text: "Using AI to filter jobs", icon: "fas fa-robot" },
            { text: "Pairing jobs...", icon: "fas fa-handshake" }
        ];
        this.currentNotificationIndex = 0;
        this.init();
    }

    init() {
        // Start the loading sequence with notifications
        this.startLoadingSequence();
        
        // Setup CTA button
        this.setupCTAButton();
        
        // Setup job popup
        this.setupJobPopup();
        
        // Setup agent notification
        this.setupAgentNotification();
        
        // Check if returning from registration
        this.checkRegistrationReturn();
        
        console.log('Statistics page initialized');
    }

    startLoadingSequence() {
        // Show first notification immediately
        this.showNotification(0);
        
        // Show remaining notifications every 2 seconds
        const notificationInterval = setInterval(() => {
            this.currentNotificationIndex++;
            
            if (this.currentNotificationIndex < this.notifications.length) {
                this.showNotification(this.currentNotificationIndex);
            } else {
                clearInterval(notificationInterval);
                // Hide notifications and show statistics
                setTimeout(() => {
                    this.hideNotifications();
                    this.showStatistics();
                }, 2000); // Show last notification for 2 seconds
            }
        }, 2000);
    }

    showNotification(index) {
        const notificationContainer = document.getElementById('notificationContainer');
        const notification = document.getElementById('loadingNotification');
        const notificationText = document.getElementById('notificationText');
        const notificationIcon = notification.querySelector('i');
        
        if (notification && notificationText && notificationIcon) {
            // Hide current notification
            notification.classList.remove('show');
            
            setTimeout(() => {
                // Update content
                const currentNotification = this.notifications[index];
                notificationText.textContent = currentNotification.text;
                notificationIcon.className = `${currentNotification.icon} me-2`;
                
                // Show new notification
                notification.classList.add('show');
            }, index === 0 ? 0 : 300); // No delay for first notification
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

        // Hide loading animation
        loadingContainer.style.display = 'none';
        
        // Show logo first
        logoContainer.style.display = 'block';
        logoContainer.style.animation = 'fadeIn 0.8s ease-in';
        
        // Show statistics content after a short delay
        setTimeout(() => {
            statisticsContent.style.display = 'block';
            statisticsContent.style.animation = 'slideUp 0.8s ease-out';
            
            // Animate numbers counting up
            this.animateNumbers();
            
            // Show job popup after statistics are displayed
            setTimeout(() => {
                this.showJobPopup();
            }, 2000);
            
            // Track statistics view
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

        // Close popup when clicking close button
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                this.hideJobPopup();
            });
        }

        // Close popup when clicking overlay
        if (popupOverlay) {
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) {
                    this.hideJobPopup();
                }
            });
        }

        // Handle apply button click - redirect to registration
        if (applyJobBtn) {
            applyJobBtn.addEventListener('click', () => {
                // Set flag to show agent notification after registration
                localStorage.setItem('showAgentNotification', 'true');
                localStorage.setItem('jobAppliedFor', 'PEA - CDOT Database');
                
                // Redirect to registration page
                window.location.href = 'registration.html';
            });
        }

        // Close popup with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideJobPopup();
            }
        });
    }

    checkRegistrationReturn() {
        // Check if user returned from registration
        const showAgentNotification = localStorage.getItem('showAgentNotification');
        if (showAgentNotification === 'true') {
            // Clear the flag
            localStorage.removeItem('showAgentNotification');
            
            // Show agent notification after a short delay
            setTimeout(() => {
                this.showAgentNotification();
            }, 1000);
        }
    }

    showAgentNotification() {
        const agentNotification = document.getElementById('agentNotification');
        if (agentNotification) {
            agentNotification.classList.add('show');
            
            // Auto-hide after 8 seconds
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
        // Get all stat number elements with data-target attributes
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        
        statNumbers.forEach((element, index) => {
            const target = parseInt(element.getAttribute('data-target'));
            const delay = index * 300; // Stagger animations
            
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
            
            // Use easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            // Format based on the target number
            if (end >= 7000000) {
                // For the people helped stat, show as 7,000,000 +
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

    handleCTAClick() {
        // Track CTA click
        this.trackCTAClick();
        
        // Add loading state to button
        const ctaButton = document.getElementById('ctaButton');
        const originalText = ctaButton.innerHTML;
        
        ctaButton.innerHTML = '<i class="fas fa-search me-2"></i>Finding Your Matches...';
        ctaButton.disabled = true;
        
        // Store user progress and preferences
        this.storeProgress();
        
        // Navigate to job preview page after short delay
        setTimeout(() => {
            window.location.href = 'job-preview.html';
        }, 1500);
    }

    storeProgress() {
        const progress = {
            completedWizard: true,
            statisticsViewed: true,
            timestamp: Date.now()
        };
        
        // Store job preferences for the preview page
        // These would typically come from previous wizard steps
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

    // Analytics tracking
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

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.statisticsPageInstance = new StatisticsPage();
});

// Export for external access
window.StatisticsPage = StatisticsPage;
