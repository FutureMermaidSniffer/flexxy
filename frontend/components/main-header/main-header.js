
if (typeof MainHeader === 'undefined') {
class MainHeader {
    constructor(options = {}) {
        
        if (window.mainHeaderInstance && window.mainHeaderInstance instanceof MainHeader) {
            console.log('MainHeader instance already exists, returning existing instance');
            return window.mainHeaderInstance;
        }
        
        this.options = {
            logoPath: 'images/FlexJobs_logo-1.png',
            searchPlaceholder: 'Search for agents...',
            locationPlaceholder: 'Anywhere',
            showSearch: true,
            contentType: 'default', 
            content: {},
            onSearch: null,
            ...options
        };
        
        this.headerElement = null;
        this.searchInput = null;
        this.locationInput = null;
        this.searchButton = null;
        this.contentArea = null;
        this.hamburgerBtn = null;
        this.mobileMenu = null;
        this.mobileMenuOverlay = null;
        this.isMenuOpen = false;
        
        this.init();
    }
    
    
    async init() {
        await this.loadHeader();
        this.setupEventListeners();
        this.injectContent();
    }
    
    
    async loadHeader() {
        try {
            
            const existingHeader = document.querySelector('.main-header');
            if (existingHeader) {
                console.log('Header HTML already loaded, using existing element');
                this.headerElement = existingHeader;
                this.bindExistingElements();
                return;
            }

            const response = await fetch('components/main-header/main-header.html');
            const html = await response.text();
            
            
            const headerContainer = document.createElement('div');
            headerContainer.innerHTML = html;
            this.headerElement = headerContainer.firstElementChild;
            
            
            const targetContainer = document.querySelector(this.options.container || 'body');
            if (targetContainer) {
                if (this.options.container) {
                    targetContainer.appendChild(this.headerElement);
                } else {
                    targetContainer.insertBefore(this.headerElement, targetContainer.firstChild);
                }
            }
            
            this.bindExistingElements();
            
        } catch (error) {
            console.error('Error loading main header:', error);
            this.createFallbackHeader();
        }
    }

    
    bindExistingElements() {
        
        this.searchInput = this.headerElement.querySelector('.search-input');
        this.locationInput = this.headerElement.querySelector('.location-input');
        this.searchButton = this.headerElement.querySelector('.search-btn');
        this.contentArea = this.headerElement.querySelector('.main-header__content');
        this.hamburgerBtn = this.headerElement.querySelector('.main-header__hamburger');
        this.mobileMenu = this.headerElement.querySelector('.main-header__mobile-menu');
        this.mobileMenuOverlay = this.headerElement.querySelector('.mobile-menu-overlay');
        
        
        const logoImg = this.headerElement.querySelector('.main-header__logo');
        if (logoImg && this.options.logoPath) {
            logoImg.src = this.options.logoPath;
        }
        
        
        if (this.searchInput && this.options.searchPlaceholder) {
            this.searchInput.placeholder = this.options.searchPlaceholder;
        }
        
        
        if (this.locationInput && this.options.locationPlaceholder) {
            this.locationInput.placeholder = this.options.locationPlaceholder;
        }
        
        
        if (!this.options.showSearch) {
            const searchContainer = this.headerElement.querySelector('.main-header__search-container');
            if (searchContainer) {
                searchContainer.style.display = 'none';
            }
        }
        
        
        this.initializeDropdowns();
        
        
        this.initializeUnifiedSearch();
        
        
        document.dispatchEvent(new CustomEvent('mainHeaderReady'));
    }
    
    
    createFallbackHeader() {
        const fallbackHTML = `
            <header class="main-header">
                <!-- Top Row - White Background -->
                <div class="main-header__top-row">
                    <div class="container">
                        <div class="row align-items-center">
                            <!-- Logo -->
                            <div class="col-6 col-md-3">
                                <div class="main-header__logo-container">
                                    <img src="${this.options.logoPath}" alt="FlexJobs" class="main-header__logo">
                                </div>
                            </div>
                            
                            <!-- Search Bar (Desktop) -->
                            <div class="col-md-6 d-none d-md-block">
                                <div class="main-header__search-container">
                                    <div class="main-header__search-bar">
                                        <div class="search-input-group">
                                            <i class="fa-solid fa-search search-icon"></i>
                                            <input type="text" class="search-input" placeholder="${this.options.searchPlaceholder}">
                                        </div>
                                        <div class="location-input-group">
                                            <i class="fa-solid fa-location-dot location-icon"></i>
                                            <input type="text" class="location-input" placeholder="${this.options.locationPlaceholder}">
                                        </div>
                                        <button class="search-btn" type="button">
                                            <i class="fa-solid fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Account (Desktop) / Menu (Mobile) -->
                            <div class="col-6 col-md-3">
                                <div class="d-flex justify-content-end align-items-center">
                                    <!-- Desktop Account Button -->
                                    <button class="main-header__account-btn d-none d-md-block">My Account</button>
                                    
                                    <!-- Mobile Hamburger -->
                                    <button class="main-header__hamburger d-md-none" type="button">
                                        <span class="hamburger-line"></span>
                                        <span class="hamburger-line"></span>
                                        <span class="hamburger-line"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Navigation Row (Desktop) -->
                <div class="main-header__nav-row d-none d-md-block">
                    <div class="container">
                        <nav class="main-header__nav">
                            <ul class="nav-list">
                                <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">Browse Jobs</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">Companies</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">Career Advice</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">About</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                
                <!-- Mobile Search Row -->
                <div class="main-header__mobile-search d-md-none">
                    <div class="container">
                        <div class="main-header__search-bar">
                            <div class="search-input-group">
                                <i class="fa-solid fa-search search-icon"></i>
                                <input type="text" class="search-input" placeholder="${this.options.searchPlaceholder}">
                            </div>
                            <div class="location-input-group">
                                <i class="fa-solid fa-location-dot location-icon"></i>
                                <input type="text" class="location-input" placeholder="${this.options.locationPlaceholder}">
                            </div>
                            <button class="search-btn" type="button">
                                <i class="fa-solid fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Dynamic Content Area -->
                <div class="main-header__content" style="display: none;">
                    <div class="container">
                        <div class="row">
                            <div class="col-12 text-center">
                                <!-- Dynamic content will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay"></div>
                
                <!-- Mobile Slide-out Menu -->
                <div class="main-header__mobile-menu">
                    <div class="mobile-menu__content">
                        <!-- Navigation Links -->
                        <ul class="mobile-nav-list">
                            <li><a href="#" class="mobile-nav-link"><i class="fa-solid fa-home me-3"></i>Home</a></li>
                            <li><a href="#" class="mobile-nav-link"><i class="fa-solid fa-briefcase me-3"></i>Browse Jobs</a></li>
                            <li><a href="#" class="mobile-nav-link"><i class="fa-solid fa-building me-3"></i>Companies</a></li>
                            <li><a href="#" class="mobile-nav-link"><i class="fa-solid fa-graduation-cap me-3"></i>Career Advice</a></li>
                            <li><a href="#" class="mobile-nav-link"><i class="fa-solid fa-info-circle me-3"></i>About</a></li>
                        </ul>
                        
                        <!-- Divider -->
                        <hr class="mobile-menu__divider">
                        
                        <!-- Account Links -->
                        <ul class="mobile-account-list">
                            <li><a href="#" class="mobile-account-link"><i class="fa-solid fa-user me-3"></i>My Account</a></li>
                            <li><a href="#" class="mobile-account-link"><i class="fa-solid fa-heart me-3"></i>Saved Jobs</a></li>
                            <li><a href="#" class="mobile-account-link"><i class="fa-solid fa-file-text me-3"></i>Applications</a></li>
                            <li><a href="#" class="mobile-account-link logout-link"><i class="fa-solid fa-sign-out-alt me-3"></i>Sign Out</a></li>
                        </ul>
                    </div>
                </div>
            </header>
        `;
        
        const headerContainer = document.createElement('div');
        headerContainer.innerHTML = fallbackHTML;
        this.headerElement = headerContainer.firstElementChild;
        
        const targetContainer = document.querySelector(this.options.container || 'body');
        if (targetContainer) {
            if (this.options.container) {
                targetContainer.appendChild(this.headerElement);
            } else {
                targetContainer.insertBefore(this.headerElement, targetContainer.firstChild);
            }
        }
        
        
        this.bindExistingElements();
        
        
        document.dispatchEvent(new CustomEvent('mainHeaderReady'));
    }
    
    
    setupEventListeners() {
        
        if (this.searchButton) {
            this.searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }
        
        
        if (this.hamburgerBtn) {
            this.hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        if (this.mobileMenuOverlay) {
            this.mobileMenuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        
        this.setupLogoutHandlers();
    }

    
    setupLogoutHandlers() {
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    
    async handleLogout() {
        if (window.auth && typeof window.auth.logout === 'function') {
            await window.auth.logout();
        } else {
            
            localStorage.removeItem('flexjobs_token');
            localStorage.removeItem('flexjobs_user');
            window.location.href = 'browse-jobs.html';
        }
    }
    
    
    initializeDropdowns() {
        
        if (!this.headerElement) {
            console.warn('Header element not found, skipping dropdown initialization');
            return;
        }
        
        
        if (typeof window.bootstrap !== 'undefined') {
            
            const dropdownElements = this.headerElement.querySelectorAll('[data-bs-toggle="dropdown"]');
            dropdownElements.forEach(element => {
                new bootstrap.Dropdown(element);
            });
        } else {
            
            this.addManualDropdownFunctionality();
        }
    }
    
    
    addManualDropdownFunctionality() {
        
        if (!this.headerElement) {
            console.warn('Header element not found, cannot add manual dropdown functionality');
            return;
        }
        
        const accountBtn = this.headerElement.querySelector('#accountDropdown');
        const dropdownMenu = this.headerElement.querySelector('.dropdown-menu');
        
        if (accountBtn && dropdownMenu) {
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                
                const isOpen = dropdownMenu.classList.contains('show');
                
                
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                
                if (!isOpen) {
                    dropdownMenu.classList.add('show');
                }
            });
            
            
            document.addEventListener('click', (e) => {
                if (!accountBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
            
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                }
            });
        } else {
            console.warn('Account button or dropdown menu not found in header');
        }
    }
    
    
    initializeUnifiedSearch() {
        
        if (typeof window.UnifiedSearch !== 'undefined') {
            try {
                
                this.unifiedSearch = new UnifiedSearch();
                console.log('Unified search initialized successfully');
            } catch (error) {
                console.error('Error initializing unified search:', error);
            }
        } else {
            console.warn('UnifiedSearch class not available. Make sure unified-search.js is loaded.');
        }
    }
    
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    
    openMobileMenu() {
        this.isMenuOpen = true;
        
        if (this.hamburgerBtn) {
            this.hamburgerBtn.classList.add('active');
        }
        
        if (this.mobileMenu) {
            this.mobileMenu.classList.add('active');
        }
        
        if (this.mobileMenuOverlay) {
            this.mobileMenuOverlay.classList.add('active');
        }
        
        
        document.body.style.overflow = 'hidden';
    }
    
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        
        if (this.hamburgerBtn) {
            this.hamburgerBtn.classList.remove('active');
        }
        
        if (this.mobileMenu) {
            this.mobileMenu.classList.remove('active');
        }
        
        if (this.mobileMenuOverlay) {
            this.mobileMenuOverlay.classList.remove('active');
        }
        
        
        document.body.style.overflow = '';
    }
    
    
    handleSearch() {
        const searchTerm = this.searchInput ? this.searchInput.value.trim() : '';
        const location = this.locationInput ? this.locationInput.value.trim() : '';
        
        
        if (this.options.onSearch && typeof this.options.onSearch === 'function') {
            this.options.onSearch({ searchTerm, location });
        } else {
            
            this.performDefaultSearch(searchTerm, location);
        }
        
        
        this.trackSearch(searchTerm, location);
    }
    
    
    performDefaultSearch(searchTerm, location) {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (location) params.append('location', location);
        
        
        let searchUrl;
        if (this.options.searchPlaceholder.toLowerCase().includes('agent')) {
            
            searchUrl = `agents.html?${params.toString()}`;
        } else {
            
            searchUrl = `job-search-results.html?${params.toString()}`;
        }
        
        window.location.href = searchUrl;
    }
    
    
    trackSearch(searchTerm, location) {
        if (window.gtag) {
            window.gtag('event', 'search', {
                search_term: searchTerm,
                location: location,
                page_path: window.location.pathname
            });
        }
    }
    
    
    injectContent() {
        if (!this.contentArea) return;
        
        let contentHTML = '';
        let showContent = false;
        
        switch (this.options.contentType) {
            case 'match':
                contentHTML = this.createMatchContent();
                showContent = true;
                break;
            case 'title':
                contentHTML = this.createTitleContent();
                showContent = true;
                break;
            case 'custom':
                contentHTML = this.options.content.html || '';
                showContent = !!contentHTML;
                break;
            case 'none':
                showContent = false;
                break;
            default:
                showContent = false;
        }
        
        if (showContent) {
            this.contentArea.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-12 text-center">
                            ${contentHTML}
                        </div>
                    </div>
                </div>
            `;
            this.contentArea.style.display = 'block';
        } else {
            this.contentArea.style.display = 'none';
        }
    }
    
    
    createMatchContent() {
        const jobCount = this.options.content.jobCount || '12,020';
        return `<div class="match-title">Join today to see ${jobCount} job matches</div>`;
    }
    
    
    createTitleContent() {
        const title = this.options.content.title || 'Welcome to FlexJobs';
        const subtitle = this.options.content.subtitle || '';
        
        let html = `<h1 class="page-title">${title}</h1>`;
        if (subtitle) {
            html += `<p class="page-subtitle">${subtitle}</p>`;
        }
        
        return html;
    }
    
    
    updateContent(contentType, content) {
        this.options.contentType = contentType;
        this.options.content = { ...this.options.content, ...content };
        this.injectContent();
    }
    
    
    updateSearch(searchTerm = '', location = '') {
        if (this.searchInput) {
            this.searchInput.value = searchTerm;
        }
        if (this.locationInput) {
            this.locationInput.value = location;
        }
    }
    
    
    toggleSearch(show = true) {
        const searchContainers = this.headerElement?.querySelectorAll('.main-header__search-container, .main-header__mobile-search');
        if (searchContainers) {
            searchContainers.forEach(container => {
                container.style.display = show ? 'block' : 'none';
            });
        }
    }
    
    
    getSearchValues() {
        return {
            searchTerm: this.searchInput ? this.searchInput.value.trim() : '',
            location: this.locationInput ? this.locationInput.value.trim() : ''
        };
    }
    
    
    destroy() {
        if (this.headerElement) {
            this.headerElement.remove();
        }
        
        
        document.body.style.overflow = '';
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainHeader;
}


window.MainHeader = MainHeader;
}
