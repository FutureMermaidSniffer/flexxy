// Benefits Page JavaScript
// Page-specific functionality for the benefits selection page

// Page-specific functionality
class BenefitsPage {
    constructor() {
        this.selectedBenefits = new Set();
        
        this.init();
    }

    init() {
        this.setupPopularBenefits();
        this.setupSkipButton();
        this.restoreFromLocalStorage();
        
        // Enable next button since benefit selection is optional
        // Ensure both desktop and mobile buttons are enabled
        this.enableNextButton();
    }

    enableNextButton() {
        setTimeout(() => {
            if (window.wizardFooter) {
                window.wizardFooter.enableNextButton();
            }
        }, 100);
    }

    addBenefit(benefit) {
        if (benefit && !this.selectedBenefits.has(benefit)) {
            this.selectedBenefits.add(benefit);
            this.updateSelectedDisplay();
            this.updateButtonStates();
            this.storeBenefitPreference();
            this.trackBenefitSelection(benefit);
        }
    }

    removeBenefit(benefit) {
        this.selectedBenefits.delete(benefit);
        this.updateSelectedDisplay();
        this.updateButtonStates();
        this.storeBenefitPreference();
    }

    setupPopularBenefits() {
        const popularBtns = document.querySelectorAll('.page-benefits__popular-btn');
        
        popularBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const benefit = btn.getAttribute('data-benefit');
                const icon = btn.querySelector('.page-benefits__btn-icon');
                
                if (this.selectedBenefits.has(benefit)) {
                    // Remove benefit
                    this.removeBenefit(benefit);
                    
                    // Change back to plus icon and remove selected styling
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-plus');
                    btn.classList.remove('selected');
                } else {
                    // Add benefit
                    this.addBenefit(benefit);
                    
                    // Change to check icon and add selected styling
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-check');
                    btn.classList.add('selected');
                }
            });
        });
    }

    setupSkipButton() {
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipBenefitSelection();
            });
        }
    }

    updateSelectedDisplay() {
        // Only update button states, no display area needed
        // Always keep next button enabled (benefit selection is optional)
        this.enableNextButton();
    }

    skipBenefitSelection() {
        // Clear any selected benefits
        this.selectedBenefits.clear();
        this.updateSelectedDisplay();
        
        // Track skip action
        this.trackSkipAction();
        
        // Go to next step
        this.goNext();
    }

    goBack() {
        // Add loading animation
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            const originalText = backBtn.innerHTML;
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            backBtn.disabled = true;
        }
        
        // Navigate back to education-level page
        setTimeout(() => {
            window.location.href = 'education-level.html';
        }, 300);
    }

    goNext() {
        // Store benefit preference
        this.storeBenefitPreference();
        
        // Add loading animation
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            nextBtn.disabled = true;
        }
        
        // Navigate to next step (statistics page)
        setTimeout(() => {
            window.location.href = 'statistics.html';
        }, 500);
    }

    storeBenefitPreference() {
        const preference = {
            benefits: Array.from(this.selectedBenefits),
            timestamp: Date.now()
        };
        
        localStorage.setItem('benefitPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('benefitPreference');
        if (stored) {
            try {
                const preference = JSON.parse(stored);
                
                if (preference.benefits && Array.isArray(preference.benefits)) {
                    preference.benefits.forEach(benefit => {
                        this.selectedBenefits.add(benefit);
                    });
                    
                    this.updateSelectedDisplay();
                    this.updateButtonStates();
                }
            } catch (e) {
                console.error('Error restoring benefit preference:', e);
            }
        }
    }

    updateButtonStates() {
        const popularBtns = document.querySelectorAll('.page-benefits__popular-btn');
        
        popularBtns.forEach(btn => {
            const benefit = btn.getAttribute('data-benefit');
            const icon = btn.querySelector('.page-benefits__btn-icon');
            
            if (this.selectedBenefits.has(benefit)) {
                // Change to check icon and add selected styling
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-check');
                btn.classList.add('selected');
            } else {
                // Change to plus icon and remove selected styling
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.classList.remove('selected');
            }
        });
    }

    trackBenefitSelection(benefit) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'benefit_selected', {
                benefit: benefit,
                total_selected: this.selectedBenefits.size,
                page: 'benefits'
            });
        }

        console.log('Benefit selected:', benefit);
    }

    trackSkipAction() {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'benefit_selection_skipped', {
                page: 'benefits'
            });
        }

        console.log('Benefit selection skipped');
    }

    // Public methods for external access
    getBenefitPreference() {
        return {
            benefits: Array.from(this.selectedBenefits)
        };
    }

    setBenefitPreference(benefits = []) {
        this.selectedBenefits = new Set(benefits);
        this.updateSelectedDisplay();
    }

    // Wizard footer navigation handlers
    handleNext() {
        this.goNext();
    }

    handleBack() {
        this.goBack();
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard header (step 5 - show back button)
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    // Initialize wizard footer
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(5, 6, 'Next');
        
        // Override navigation handlers for both desktop and mobile
        window.wizardFooter.handleNext = () => {
            if (window.benefitsPageInstance) {
                window.benefitsPageInstance.handleNext();
            }
        };
        
        window.wizardFooter.handleBack = () => {
            if (window.benefitsPageInstance) {
                window.benefitsPageInstance.handleBack();
            }
        };
        
        // Enable next button since benefit selection is optional
        setTimeout(() => {
            window.wizardFooter.enableNextButton();
        }, 200);
    }
    
    // Initialize page functionality
    window.benefitsPageInstance = new BenefitsPage();
});

// Load header and footer components
if (typeof loadComponents === 'function') {
    loadComponents();
}

// Set active navigation when components are loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        window.headerInstance.setActiveNav('remote-jobs');
    }
});

// Export for external access
window.BenefitsPage = BenefitsPage;
