
class WizardHeader {
    constructor(options = {}) {
        this.isFirstPage = options.isFirstPage || false;
        this.backUrl = options.backUrl || '';
        this.onBackClick = options.onBackClick || null;
        
        this.render();
        this.setupEventListeners();
        this.setupResizeListener();
    }

    render() {
        const headerContainer = document.getElementById('wizard-header-container');
        if (!headerContainer) return;

        const headerClass = this.isFirstPage ? 'wizard-header wizard-header--first-page' : 'wizard-header';
        
        
        const isMobile = window.innerWidth <= 768;
        const logoSrc = isMobile ? 'images/images.png' : 'images/FlexJobs_logo-1.png';
        
        headerContainer.innerHTML = `
            <header class="${headerClass}">
                <div class="wizard-header__container">
                    <div class="wizard-header__content">
                        <!-- Logo -->
                        <div class="wizard-header__logo-container">
                            <img src="${logoSrc}" alt="FlexJobs" class="wizard-header__logo">
                        </div>
                        
                        <!-- Back Button (hidden on first page) -->
                        ${!this.isFirstPage ? `
                            <button class="wizard-header__back-btn" id="wizardBackBtn">
                                <i class="fas fa-arrow-left"></i>
                                Back
                            </button>
                        ` : ''}
                    </div>
                </div>
            </header>
        `;
    }

    setupEventListeners() {
        if (!this.isFirstPage) {
            const backBtn = document.getElementById('wizardBackBtn');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (this.onBackClick) {
                        this.onBackClick();
                    } else if (this.backUrl) {
                        
                        backBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                        backBtn.disabled = true;
                        
                        setTimeout(() => {
                            window.location.href = this.backUrl;
                        }, 300);
                    }
                });
            }
        }
    }

    setBackUrl(url) {
        this.backUrl = url;
    }

    setBackClickHandler(handler) {
        this.onBackClick = handler;
    }

    showLoading() {
        const backBtn = document.getElementById('wizardBackBtn');
        if (backBtn) {
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            backBtn.disabled = true;
        }
    }

    hideLoading() {
        const backBtn = document.getElementById('wizardBackBtn');
        if (backBtn) {
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
            backBtn.disabled = false;
        }
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                
                const logoImg = document.querySelector('.wizard-header__logo');
                if (logoImg) {
                    const isMobile = window.innerWidth <= 768;
                    const logoSrc = isMobile ? 'images/images.png' : 'images/FlexJobs_logo-1.png';
                    logoImg.src = logoSrc;
                }
            }, 100);
        });
    }
}


window.WizardHeader = WizardHeader;
