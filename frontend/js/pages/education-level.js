// Education Level Page JavaScript

// Page-specific functionality
class EducationLevelPage {
    constructor() {
        this.selectedEducation = null;
        
        this.init();
    }

    init() {
        this.setupEducationOptions();
        this.restoreFromLocalStorage();
        this.setupNavigation();
    }

    setupEducationOptions() {
        const educationOptions = document.querySelectorAll('.work-option');
        
        educationOptions.forEach(option => {
            option.addEventListener('click', () => {
                const education = option.getAttribute('data-education');
                this.selectEducation(education, option);
            });
        });
    }

    selectEducation(education, optionElement) {
        // Clear previous selections
        this.clearSelections();
        
        this.selectedEducation = education;
        
        // Update UI - add selected class
        optionElement.classList.add('selected');
        
        // Show success message
        this.showSuccessMessage();
        
        // Enable wizard footer
        this.enableWizardFooter();
        
        this.storeEducationPreference();
        this.trackEducationSelection(education);
    }

    clearSelections() {
        const allOptions = document.querySelectorAll('.work-option');
        
        allOptions.forEach(option => {
            option.classList.remove('selected');
        });
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.classList.add('show');
        }
    }

    enableWizardFooter() {
        if (window.wizardFooter) {
            window.wizardFooter.enableNextButton();
        }
    }

    handleNext() {
        this.goNext();
    }

    goNext() {
        if (!this.selectedEducation) return;
        
        // Navigate to next step (benefits)
        setTimeout(() => {
            window.location.href = 'benefits.html';
        }, 500);
    }

    setupNavigation() {
        // Navigation handled by wizard footer
    }

    storeEducationPreference() {
        const preference = {
            education: this.selectedEducation,
            timestamp: Date.now()
        };
        
        localStorage.setItem('educationPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('educationPreference');
        if (stored) {
            try {
                const preference = JSON.parse(stored);
                
                if (preference.education) {
                    const optionElement = document.querySelector(`[data-education="${preference.education}"]`);
                    if (optionElement) {
                        this.selectEducation(preference.education, optionElement);
                    }
                }
            } catch (e) {
                console.error('Error restoring education preference:', e);
            }
        }
    }

    trackEducationSelection(education) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'education_selected', {
                education_level: education,
                page: 'education-level'
            });
        }

        console.log('Education selected:', education);
    }

    // Public methods for external access
    getEducationPreference() {
        return {
            education: this.selectedEducation
        };
    }

    setEducationPreference(education) {
        const optionElement = document.querySelector(`[data-education="${education}"]`);
        if (optionElement) {
            this.selectEducation(education, optionElement);
        }
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page first
    const educationLevelPageInstance = new EducationLevelPage();
    window.educationLevelPageInstance = educationLevelPageInstance;
    
    // Initialize wizard header and footer
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(2, 6, 'Next');
        // Override the handleNext method
        window.wizardFooter.handleNext = () => {
            if (window.educationLevelPageInstance) {
                window.educationLevelPageInstance.handleNext();
            }
        };
    }
});

// Load components
if (typeof loadComponents === 'function') {
    loadComponents();
}

// Export class for external access
window.EducationLevelPage = EducationLevelPage;
