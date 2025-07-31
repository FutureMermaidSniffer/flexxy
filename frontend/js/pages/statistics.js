// Statistics Page JavaScript
// Handles the loading animation and statistics display

class StatisticsPage {
    constructor() {
        this.loadingDuration = 3000; // 3 seconds loading
        this.init();
    }

    init() {
        // Start the loading sequence
        this.startLoadingSequence();
        
        // Setup CTA button
        this.setupCTAButton();
        
        console.log('Statistics page initialized');
    }

    startLoadingSequence() {
        // Show loading animation for 3 seconds
        setTimeout(() => {
            this.showStatistics();
        }, this.loadingDuration);
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
            
            // Track statistics view
            this.trackStatisticsView();
        }, 500);
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
