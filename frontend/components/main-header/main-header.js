/**
 * Main Header Component
 * Provides a reusable header with logo, search bar, navigation, and mobile menu
 */
if (typeof MainHeader === 'undefined') {
class MainHeader {
    constructor(options = {}) {
        // Prevent multiple instances if one already exists globally
        if (window.mainHeaderInstance && window.mainHeaderInstance instanceof MainHeader) {
            console.log('MainHeader instance already exists, returning existing instance');
            return window.mainHeaderInstance;
        }
        
        this.options = {
            logoPath: 'images/FlexJobs_logo-1.png',
            searchPlaceholder: 'Search for agents...',
            locationPlaceholder: 'Anywhere',
            showSearch: true,
            contentType: 'default', // 'match', 'title', 'custom'
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
    
    /**
     * Initialize the header component
     */
    async init() {
        await this.loadHeader();
        this.setupEventListeners();
        this.injectContent();
    }
    
    /**
     * Load the header HTML structure
     */
    async loadHeader() {
        try {
            // Check if header HTML is already loaded by ComponentLoader
            const existingHeader = document.querySelector('.main-header');
            if (existingHeader) {
                console.log('Header HTML already loaded, using existing element');
                this.headerElement = existingHeader;
                this.bindExistingElements();
                return;
            }

            const response = await fetch('components/main-header/main-header.html');
            const html = await response.text();
            
            // Create header container
            const headerContainer = document.createElement('div');
            headerContainer.innerHTML = html;
            this.headerElement = headerContainer.firstElementChild;
            
            // Insert at the beginning of the body or specified container
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

    /**
     * Bind elements when header HTML already exists
     */
    bindExistingElements() {
        // Get references to elements
        this.searchInput = this.headerElement.querySelector('.search-input');
        this.locationInput = this.headerElement.querySelector('.location-input');
        this.searchButton = this.headerElement.querySelector('.search-btn');
        this.contentArea = this.headerElement.querySelector('.main-header__content');
        this.hamburgerBtn = this.headerElement.querySelector('.main-header__hamburger');
        this.mobileMenu = this.headerElement.querySelector('.main-header__mobile-menu');
        this.mobileMenuOverlay = this.headerElement.querySelector('.mobile-menu-overlay');
        
        // Update logo path if needed
        const logoImg = this.headerElement.querySelector('.main-header__logo');
        if (logoImg && this.options.logoPath) {
            logoImg.src = this.options.logoPath;
        }
        
        // Update search placeholder
        if (this.searchInput && this.options.searchPlaceholder) {
            this.searchInput.placeholder = this.options.searchPlaceholder;
        }
        
        // Update location placeholder
        if (this.locationInput && this.options.locationPlaceholder) {
            this.locationInput.placeholder = this.options.locationPlaceholder;
        }
        
        // Hide search if not needed
        if (!this.options.showSearch) {
            const searchContainer = this.headerElement.querySelector('.main-header__search-container');
            if (searchContainer) {
                searchContainer.style.display = 'none';
            }
        }
        
        // Initialize dropdowns after header is fully loaded
        this.initializeDropdowns();
        
        // Initialize unified search functionality
        this.initializeUnifiedSearch();
        
        // Dispatch event to notify that main header is ready
        document.dispatchEvent(new CustomEvent('mainHeaderReady'));
    }
    
    /**
     * Create a fallback header if loading fails
     */
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
        
        // Use the same binding method for consistency
        this.bindExistingElements();
        
        // Dispatch event to notify that main header is ready (fallback)
        document.dispatchEvent(new CustomEvent('mainHeaderReady'));
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
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
        
        // Mobile menu functionality
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
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle logout buttons
        this.setupLogoutHandlers();
    }

    /**
     * Setup logout button event handlers
     */
    setupLogoutHandlers() {
        // Use event delegation to handle logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    /**
     * Handle logout functionality
     */
    async handleLogout() {
        if (window.auth && typeof window.auth.logout === 'function') {
            await window.auth.logout();
        } else {
            // Fallback logout if auth object is not available
            localStorage.removeItem('flexjobs_token');
            localStorage.removeItem('flexjobs_user');
            window.location.href = 'browse-jobs.html';
        }
    }
    
    /**
     * Initialize Bootstrap dropdowns
     */
    initializeDropdowns() {
        // Ensure header element exists before trying to initialize dropdowns
        if (!this.headerElement) {
            console.warn('Header element not found, skipping dropdown initialization');
            return;
        }
        
        // Check if Bootstrap is available
        if (typeof window.bootstrap !== 'undefined') {
            // Initialize all dropdowns in the header
            const dropdownElements = this.headerElement.querySelectorAll('[data-bs-toggle="dropdown"]');
            dropdownElements.forEach(element => {
                new bootstrap.Dropdown(element);
            });
        } else {
            // Fallback: Add manual dropdown functionality
            this.addManualDropdownFunctionality();
        }
    }
    
    /**
     * Add manual dropdown functionality if Bootstrap is not available
     */
    addManualDropdownFunctionality() {
        // Double-check that header element exists
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
                
                // Toggle dropdown
                const isOpen = dropdownMenu.classList.contains('show');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                
                if (!isOpen) {
                    dropdownMenu.classList.add('show');
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!accountBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
            
            // Close dropdown on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                }
            });
        } else {
            console.warn('Account button or dropdown menu not found in header');
        }
    }
    
    /**
     * Initialize unified search functionality
     */
    initializeUnifiedSearch() {
        // Check if UnifiedSearch class is available
        if (typeof window.UnifiedSearch !== 'undefined') {
            try {
                // Initialize unified search with the search inputs in the header
                this.unifiedSearch = new UnifiedSearch();
                console.log('Unified search initialized successfully');
            } catch (error) {
                console.error('Error initializing unified search:', error);
            }
        } else {
            console.warn('UnifiedSearch class not available. Make sure unified-search.js is loaded.');
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    /**
     * Open mobile menu
     */
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
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close mobile menu
     */
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
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    /**
     * Handle search functionality
     */
    handleSearch() {
        const searchTerm = this.searchInput ? this.searchInput.value.trim() : '';
        const location = this.locationInput ? this.locationInput.value.trim() : '';
        
        // Call custom search handler if provided
        if (this.options.onSearch && typeof this.options.onSearch === 'function') {
            this.options.onSearch({ searchTerm, location });
        } else {
            // Default search behavior
            this.performDefaultSearch(searchTerm, location);
        }
        
        // Track search event
        this.trackSearch(searchTerm, location);
    }
    
    /**
     * Perform default search behavior
     */
    performDefaultSearch(searchTerm, location) {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (location) params.append('location', location);
        
        // Determine search type based on placeholder or explicit option
        let searchUrl;
        if (this.options.searchPlaceholder.toLowerCase().includes('agent')) {
            // Agent search
            searchUrl = `agents.html?${params.toString()}`;
        } else {
            // Default job search
            searchUrl = `job-search-results.html?${params.toString()}`;
        }
        
        window.location.href = searchUrl;
    }
    
    /**
     * Track search analytics
     */
    trackSearch(searchTerm, location) {
        if (window.gtag) {
            window.gtag('event', 'search', {
                search_term: searchTerm,
                location: location,
                page_path: window.location.pathname
            });
        }
    }
    
    /**
     * Inject content into the header content area
     */
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
    
    /**
     * Create job match content
     */
    createMatchContent() {
        const jobCount = this.options.content.jobCount || '12,020';
        return `<div class="match-title">Join today to see ${jobCount} job matches</div>`;
    }
    
    /**
     * Create title content
     */
    createTitleContent() {
        const title = this.options.content.title || 'Welcome to FlexJobs';
        const subtitle = this.options.content.subtitle || '';
        
        let html = `<h1 class="page-title">${title}</h1>`;
        if (subtitle) {
            html += `<p class="page-subtitle">${subtitle}</p>`;
        }
        
        return html;
    }
    
    /**
     * Update header content dynamically
     */
    updateContent(contentType, content) {
        this.options.contentType = contentType;
        this.options.content = { ...this.options.content, ...content };
        this.injectContent();
    }
    
    /**
     * Update search values
     */
    updateSearch(searchTerm = '', location = '') {
        if (this.searchInput) {
            this.searchInput.value = searchTerm;
        }
        if (this.locationInput) {
            this.locationInput.value = location;
        }
    }
    
    /**
     * Show/hide search bar
     */
    toggleSearch(show = true) {
        const searchContainers = this.headerElement?.querySelectorAll('.main-header__search-container, .main-header__mobile-search');
        if (searchContainers) {
            searchContainers.forEach(container => {
                container.style.display = show ? 'block' : 'none';
            });
        }
    }
    
    /**
     * Get search values
     */
    getSearchValues() {
        return {
            searchTerm: this.searchInput ? this.searchInput.value.trim() : '',
            location: this.locationInput ? this.locationInput.value.trim() : ''
        };
    }
    
    /**
     * Destroy the component
     */
    destroy() {
        if (this.headerElement) {
            this.headerElement.remove();
        }
        
        // Restore body scroll if menu was open
        document.body.style.overflow = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainHeader;
}

// Make available globally
window.MainHeader = MainHeader;
}
