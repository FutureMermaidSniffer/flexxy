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
                    <button class="wizard-footer__btn wizard-footer__btn--back ${this.currentStep <= 1 ? 'disabled' : ''}" id="desktopBackBtn">
                        Back
                    </button>
                    <div class="wizard-footer__progress">
                        <div class="wizard-footer__progress-bar-container">
                            <div class="wizard-footer__progress-bar" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    <button class="wizard-footer__btn wizard-footer__btn--next ${this.isEnabled ? 'enabled' : ''}" id="desktopNextBtn">
                        ${this.nextButtonText}
                    </button>
                </div>
            </footer>
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
        // Bind mobile next button
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            // Remove existing listeners to prevent duplicates
            mobileNextBtn.removeEventListener('click', this.handleMobileClick);
            this.handleMobileClick = () => {
                if (this.isEnabled) {
                    this.handleNext();
                }
            };
            mobileNextBtn.addEventListener('click', this.handleMobileClick);
        }

        // Bind desktop navigation buttons
        const desktopNextBtn = document.getElementById('desktopNextBtn');
        const desktopBackBtn = document.getElementById('desktopBackBtn');
        
        if (desktopNextBtn) {
            // Remove existing listeners to prevent duplicates
            desktopNextBtn.removeEventListener('click', this.handleDesktopNextClick);
            this.handleDesktopNextClick = () => {
                if (this.isEnabled) {
                    this.handleNext();
                }
            };
            desktopNextBtn.addEventListener('click', this.handleDesktopNextClick);
        }

        if (desktopBackBtn) {
            // Remove existing listeners to prevent duplicates
            desktopBackBtn.removeEventListener('click', this.handleDesktopBackClick);
            this.handleDesktopBackClick = () => {
                if (this.currentStep > 1) {
                    this.handleBack();
                }
            };
            desktopBackBtn.addEventListener('click', this.handleDesktopBackClick);
        }
    }

    handleNext() {
        // This method should be overridden by each page
        console.log('Next button clicked');
    }

    handleBack() {
        // This method should be overridden by each page
        console.log('Back button clicked');
    }

    updateProgress(currentStep) {
        this.currentStep = currentStep;
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        
        // Update mobile progress
        const mobileProgressText = document.querySelector('.wizard-mobile-footer__progress-text');
        const mobileProgressBar = document.querySelector('.wizard-mobile-footer__progress-bar');
        
        if (mobileProgressText) {
            mobileProgressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
        
        if (mobileProgressBar) {
            mobileProgressBar.style.width = `${progressPercentage}%`;
        }

        // Update desktop progress
        const desktopProgressBar = document.querySelector('.wizard-footer__progress-bar');
        if (desktopProgressBar) {
            desktopProgressBar.style.width = `${progressPercentage}%`;
        }

        // Update desktop back button state
        const desktopBackBtn = document.getElementById('desktopBackBtn');
        if (desktopBackBtn) {
            if (this.currentStep <= 1) {
                desktopBackBtn.classList.add('disabled');
            } else {
                desktopBackBtn.classList.remove('disabled');
            }
        }
    }

    enableNextButton() {
        this.isEnabled = true;
        
        // Enable mobile button
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.classList.add('enabled');
        }

        // Enable desktop button
        const desktopNextBtn = document.getElementById('desktopNextBtn');
        if (desktopNextBtn) {
            desktopNextBtn.classList.add('enabled');
        }
    }

    disableNextButton() {
        this.isEnabled = false;
        
        // Disable mobile button
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.classList.remove('enabled');
        }

        // Disable desktop button
        const desktopNextBtn = document.getElementById('desktopNextBtn');
        if (desktopNextBtn) {
            desktopNextBtn.classList.remove('enabled');
        }
    }

    setNextButtonText(text) {
        this.nextButtonText = text;
        
        // Update mobile button
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        if (mobileNextBtn) {
            mobileNextBtn.textContent = text;
        }

        // Update desktop button
        const desktopNextBtn = document.getElementById('desktopNextBtn');
        if (desktopNextBtn) {
            desktopNextBtn.textContent = text;
        }
    }
}

// Export for global use
window.WizardFooter = WizardFooter;

// Export for global use
window.WizardFooter = WizardFooter;
