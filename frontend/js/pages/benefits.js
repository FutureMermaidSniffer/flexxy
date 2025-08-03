



class BenefitsPage {
    constructor() {
        this.selectedBenefits = new Set();
        
        this.init();
    }

    init() {
        this.setupPopularBenefits();
        this.setupSkipButton();
        this.restoreFromLocalStorage();
        
        
        
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
                    
                    this.removeBenefit(benefit);
                    
                    
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-plus');
                    btn.classList.remove('selected');
                } else {
                    
                    this.addBenefit(benefit);
                    
                    
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
        
        
        this.enableNextButton();
    }

    skipBenefitSelection() {
        
        this.selectedBenefits.clear();
        this.updateSelectedDisplay();
        
        
        this.trackSkipAction();
        
        
        this.goNext();
    }

    goBack() {
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            const originalText = backBtn.innerHTML;
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            backBtn.disabled = true;
        }
        
        
        setTimeout(() => {
            window.location.href = 'education-level.html';
        }, 300);
    }

    goNext() {
        
        this.storeBenefitPreference();
        
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            nextBtn.disabled = true;
        }
        
        
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
                
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-check');
                btn.classList.add('selected');
            } else {
                
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.classList.remove('selected');
            }
        });
    }

    trackBenefitSelection(benefit) {
        
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
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'benefit_selection_skipped', {
                page: 'benefits'
            });
        }

        console.log('Benefit selection skipped');
    }

    
    getBenefitPreference() {
        return {
            benefits: Array.from(this.selectedBenefits)
        };
    }

    setBenefitPreference(benefits = []) {
        this.selectedBenefits = new Set(benefits);
        this.updateSelectedDisplay();
    }

    
    handleNext() {
        this.goNext();
    }

    handleBack() {
        this.goBack();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(5, 6, 'Next');
        
        
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
        
        
        setTimeout(() => {
            window.wizardFooter.enableNextButton();
        }, 200);
    }
    
    
    window.benefitsPageInstance = new BenefitsPage();
});


if (typeof loadComponents === 'function') {
    loadComponents();
}


document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        window.headerInstance.setActiveNav('remote-jobs');
    }
});


window.BenefitsPage = BenefitsPage;
