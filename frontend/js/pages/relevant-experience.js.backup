/**
 * Relevant Experience Page JavaScript
 * Handles work type selection and wizard navigation
 */

// Initialize wizard header and footer
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard header (first page - no back button)
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: true
        });
    }
    
    // Initialize wizard footer
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(1, 6, 'Next');
        // Override the handleNext method
        window.wizardFooter.handleNext = () => {
            window.relevantExperiencePageInstance.handleNext();
        };
    }
    
    // Initialize page functionality
    window.relevantExperiencePageInstance = new RelevantExperiencePage();
});

class RelevantExperiencePage {
    constructor() {
        this.selectedWorkType = null;
        this.init();
    }

    init() {
        this.setupWorkTypeSelection();
        this.setupNavigation();
        this.restoreFromLocalStorage();
    }

    setupWorkTypeSelection() {
        const workOptions = document.querySelectorAll('.work-option');
        
        workOptions.forEach(option => {
            option.addEventListener('click', () => {
                const workType = option.getAttribute('data-work-type');
                this.selectWorkType(workType, option);
            });
            
            // Keyboard accessibility
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const workType = option.getAttribute('data-work-type');
                    this.selectWorkType(workType, option);
                }
            });
        });
    }

    selectWorkType(workType, optionElement) {
        // Clear previous selections
        this.clearSelections();
        
        // Set new selection
        this.selectedWorkType = workType;
        optionElement.classList.add('selected');
        
        // Show success message
        this.showSuccessMessage();
        
        // Show next button and enable footer
        this.showNextButton();
        this.enableWizardFooter();
        
        // Store preference
        this.storeWorkTypePreference();
        
        // Track selection
        this.trackWorkTypeSelection(workType);
    }

    clearSelections() {
        const workOptions = document.querySelectorAll('.work-option');
        workOptions.forEach(option => {
            option.classList.remove('selected');
        });
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.add('show');
        }
    }

    showNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            setTimeout(() => {
                nextBtn.classList.add('show');
            }, 300);
        }
    }

    enableWizardFooter() {
        if (window.wizardFooter) {
            window.wizardFooter.enableNextButton();
        }
    }

    setupNavigation() {
        const nextBtn = document.getElementById('nextBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.handleNext();
            });
        }
    }

    handleNext() {
        this.goNext();
    }

    goNext() {
        if (!this.selectedWorkType) return;
        
        // Add loading animation
        const nextBtn = document.getElementById('nextBtn');
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        
        if (nextBtn) {
            nextBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
            nextBtn.disabled = true;
        }
        if (mobileNextBtn) {
            mobileNextBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
        }
        
        // Navigate to next step
        setTimeout(() => {
            window.location.href = '/education-level.html';
        }, 500);
    }

    storeWorkTypePreference() {
        const preference = {
            workType: this.selectedWorkType,
            timestamp: Date.now()
        };
        
        localStorage.setItem('workTypePreference', this.selectedWorkType);
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('workTypePreference');
        if (stored) {
            try {
                const workType = stored;
                const optionElement = document.querySelector(`[data-work-type="${workType}"]`);
                if (optionElement) {
                    this.selectWorkType(workType, optionElement);
                }
            } catch (e) {
                console.error('Error restoring work type preference:', e);
            }
        }
    }

    trackWorkTypeSelection(workType) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'work_type_selected', {
                'work_type': workType,
                'page': 'relevant-experience'
            });
        }
        
        console.log('Work type selected:', workType);
    }

    // Public methods for external access
    getWorkTypePreference() {
        return {
            workType: this.selectedWorkType
        };
    }

    setWorkTypePreference(workType) {
        const optionElement = document.querySelector(`[data-work-type="${workType}"]`);
        if (optionElement) {
            this.selectWorkType(workType, optionElement);
        }
    }
}
