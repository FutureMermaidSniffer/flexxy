// Wizard Footer Component
class WizardFooter {
    constructor(currentStep = 1, totalSteps = 6, nextButtonText = 'Next') {
        this.currentStep = currentStep;
        this.totalSteps = totalSteps;
        this.nextButtonText = nextButtonText;
        this.isEnabled = false;
        this.render();
        this.bindEvents();
    }

    render() {
        const footerContainer = document.getElementById('wizard-footer-container');
        if (!footerContainer) {
            console.warn('Wizard footer container not found');
            return;
        }

        const progressPercentage = (this.currentStep / this.totalSteps) * 100;

        footerContainer.innerHTML = `
            <!-- Desktop Footer -->
            <footer class="wizard-footer d-none d-md-block">
                <div class="wizard-footer__container">
                    <div class="wizard-footer__content">
                        <p class="wizard-footer__text">
                            © ${new Date().getFullYear()} FlexJobs
                            <span class="wizard-footer__divider">•</span>
                            <a href="/privacy" class="wizard-footer__link">Privacy Policy</a>
                            <span class="wizard-footer__divider">•</span>
                            <a href="/terms" class="wizard-footer__link">Terms of Service</a>
                            <span class="wizard-footer__divider">•</span>
                            <a href="/help" class="wizard-footer__link">Help</a>
                        </p>
                    </div>
                </div>
            </footer>
            
            <!-- Mobile Sticky Footer -->
            <div class="wizard-mobile-footer d-block d-md-none" id="wizardMobileFooter">
                <div class="wizard-mobile-footer__progress">
                    <div class="wizard-mobile-footer__progress-text">
                        Step ${this.currentStep} of ${this.totalSteps}
                    </div>
                    <div class="wizard-mobile-footer__progress-bar-container">
                        <div class="wizard-mobile-footer__progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                <button class="wizard-mobile-footer__button ${this.isEnabled ? 'enabled' : ''}" id="mobileNextBtn">
                    ${this.nextButtonText}
                </button>
            </div>
        `;
        
        // Re-bind events after rendering
        setTimeout(() => this.bindEvents(), 100);
    }

    bindEvents() {
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            // Remove existing listeners to prevent duplicates
            mobileNextBtn.removeEventListener('click', this.handleClick);
            this.handleClick = () => {
                if (this.isEnabled) {
                    this.handleNext();
                }
            };
            mobileNextBtn.addEventListener('click', this.handleClick);
        } else {
            console.warn('Mobile next button not found for event binding');
        }
    }

    handleNext() {
        // This method should be overridden by each page
        console.log('Next button clicked');
    }

    updateProgress(currentStep) {
        this.currentStep = currentStep;
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        
        const progressText = document.querySelector('.wizard-mobile-footer__progress-text');
        const progressBar = document.querySelector('.wizard-mobile-footer__progress-bar');
        
        if (progressText) {
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        } else {
            console.warn('Progress text element not found');
        }
        
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        } else {
            console.warn('Progress bar element not found');
        }
    }

    enableNextButton() {
        this.isEnabled = true;
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.classList.add('enabled');
        } else {
            console.warn('Mobile next button not found when trying to enable');
        }
    }

    disableNextButton() {
        this.isEnabled = false;
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.classList.remove('enabled');
        } else {
            console.warn('Mobile next button not found when trying to disable');
        }
    }

    setNextButtonText(text) {
        this.nextButtonText = text;
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.textContent = text;
        }
    }
}

// Export for global use
window.WizardFooter = WizardFooter;

// Export for global use
window.WizardFooter = WizardFooter;
