

class FlexJobsHeader {
    constructor() {
        this.isMobile = window.innerWidth < 992;
        this.isScrolled = false;
        this.searchActive = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setActiveNavItem();
        this.handleResponsive();
        
        
        document.addEventListener('DOMContentLoaded', () => {
            this.updateHeaderState();
        });
    }
    
    bindEvents() {
        
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        
        window.addEventListener('resize', this.handleResize.bind(this));
        
        
        const mobileSearchToggle = document.querySelector('.mobile-header__search-toggle');
        if (mobileSearchToggle) {
            mobileSearchToggle.addEventListener('click', this.toggleMobileSearch.bind(this));
        }
        
        
        const mobileMenuToggle = document.querySelector('.mobile-header__menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        
        const searchForms = document.querySelectorAll('.pc-search-form, .mobile-search-bar .input-group');
        searchForms.forEach(form => {
            const submitBtn = form.querySelector('.pc-search-btn, .mobile-search-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', this.handleSearch.bind(this));
            }
            
            
            const inputs = form.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSearch(e);
                    }
                });
            });
        });
        
        
        const advancedSearchBtn = document.querySelector('.pc-header__advanced-search');
        if (advancedSearchBtn) {
            advancedSearchBtn.addEventListener('click', this.toggleAdvancedSearch.bind(this));
        }
        
        
        const navItems = document.querySelectorAll('.pc-nav-item, .mobile-nav-menu__item');
        navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        
        const filterChips = document.querySelectorAll('.mobile-filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', this.handleFilterClick.bind(this));
        });
        
        
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        
        
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const wasScrolled = this.isScrolled;
        this.isScrolled = scrollTop > 100;
        
        if (this.isScrolled !== wasScrolled) {
            this.updateHeaderState();
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 992;
        
        if (this.isMobile !== wasMobile) {
            this.handleResponsive();
            this.closeMobileMenus();
        }
    }
    
    handleResponsive() {
        const mobileHeader = document.querySelector('.mobile-header');
        const pcHeader = document.querySelector('.pc-header');
        
        if (this.isMobile) {
            if (mobileHeader) mobileHeader.classList.remove('mobile-only');
            if (pcHeader) pcHeader.classList.add('desktop-only');
        } else {
            if (mobileHeader) mobileHeader.classList.add('mobile-only');
            if (pcHeader) pcHeader.classList.remove('desktop-only');
        }
    }
    
    updateHeaderState() {
        const headers = document.querySelectorAll('.mobile-header, .pc-header');
        headers.forEach(header => {
            if (this.isScrolled) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }
    
    toggleMobileSearch(e) {
        e.preventDefault();
        const searchCollapse = document.querySelector('#mobileSearch');
        const menuCollapse = document.querySelector('#mobileNavMenu');
        
        if (searchCollapse) {
            
            if (menuCollapse && menuCollapse.classList.contains('show')) {
                const menuToggle = new bootstrap.Collapse(menuCollapse);
                menuToggle.hide();
            }
            
            
            const searchToggle = new bootstrap.Collapse(searchCollapse);
            if (searchCollapse.classList.contains('show')) {
                searchToggle.hide();
                this.searchActive = false;
            } else {
                searchToggle.show();
                this.searchActive = true;
                
                
                setTimeout(() => {
                    const searchInput = searchCollapse.querySelector('input[type="text"]');
                    if (searchInput) searchInput.focus();
                }, 300);
            }
        }
    }
    
    toggleMobileMenu(e) {
        e.preventDefault();
        const menuCollapse = document.querySelector('#mobileNavMenu');
        const searchCollapse = document.querySelector('#mobileSearch');
        
        if (menuCollapse) {
            
            if (searchCollapse && searchCollapse.classList.contains('show')) {
                const searchToggle = new bootstrap.Collapse(searchCollapse);
                searchToggle.hide();
                this.searchActive = false;
            }
            
            
            const menuToggle = new bootstrap.Collapse(menuCollapse);
            if (menuCollapse.classList.contains('show')) {
                menuToggle.hide();
            } else {
                menuToggle.show();
            }
        }
    }
    
    closeMobileMenus() {
        const searchCollapse = document.querySelector('#mobileSearch');
        const menuCollapse = document.querySelector('#mobileNavMenu');
        
        [searchCollapse, menuCollapse].forEach(element => {
            if (element && element.classList.contains('show')) {
                const collapse = new bootstrap.Collapse(element);
                collapse.hide();
            }
        });
        
        this.searchActive = false;
    }
    
    handleSearch(e) {
        e.preventDefault();
        
        const form = e.target.closest('.pc-search-form, .mobile-search-bar .input-group');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[type="text"]');
        const searchData = {};
        
        if (this.isMobile) {
            
            searchData.query = inputs[0]?.value.trim() || '';
        } else {
            
            searchData.query = inputs[0]?.value.trim() || '';
            searchData.location = inputs[1]?.value.trim() || '';
        }
        
        
        const activeFilters = document.querySelectorAll('.mobile-filter-chip.active');
        searchData.filters = Array.from(activeFilters).map(chip => chip.textContent.trim());
        
        this.performSearch(searchData);
    }
    
    performSearch(searchData) {
        console.log('Performing search:', searchData);
        
        
        const searchBtns = document.querySelectorAll('.pc-search-btn, .mobile-search-btn');
        searchBtns.forEach(btn => btn.classList.add('loading'));
        
        
        const params = new URLSearchParams();
        if (searchData.query) params.append('q', searchData.query);
        if (searchData.location) params.append('location', searchData.location);
        if (searchData.filters.length > 0) params.append('filters', searchData.filters.join(','));
        
        const searchUrl = `/remote-jobs?${params.toString()}`;
        
        
        setTimeout(() => {
            window.location.href = searchUrl;
        }, 500);
    }
    
    toggleAdvancedSearch(e) {
        e.preventDefault();
        
        console.log('Advanced search clicked');
    }
    
    handleNavigation(e) {
        
        const href = e.target.href;
        if (href) {
            console.log('Navigation to:', href);
            
            
            if (this.isMobile) {
                this.closeMobileMenus();
            }
        }
    }
    
    handleFilterClick(e) {
        e.preventDefault();
        const chip = e.target;
        
        
        if (chip.classList.contains('active')) {
            if (chip.textContent.trim() !== 'All') {
                chip.classList.remove('active');
            }
        } else {
            
            if (chip.textContent.trim() !== 'All') {
                const allChip = document.querySelector('.mobile-filter-chip[href="#"]:first-child');
                if (allChip) allChip.classList.remove('active');
            } else {
                
                document.querySelectorAll('.mobile-filter-chip.active').forEach(activeChip => {
                    activeChip.classList.remove('active');
                });
            }
            chip.classList.add('active');
        }
        
        
        if (window.location.pathname === '/remote-jobs') {
            this.updateSearchResults();
        }
    }
    
    updateSearchResults() {
        
        console.log('Updating search results based on filters');
    }
    
    handleOutsideClick(e) {
        
        if (this.isMobile && !e.target.closest('.mobile-header')) {
            this.closeMobileMenus();
        }
    }
    
    handleKeyboardShortcuts(e) {
        
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            
            if (this.isMobile) {
                const searchToggle = document.querySelector('.mobile-header__search-toggle');
                if (searchToggle) searchToggle.click();
            } else {
                const searchInput = document.querySelector('.pc-search-input');
                if (searchInput) searchInput.focus();
            }
        }
        
        
        if (e.key === 'Escape' && this.isMobile) {
            this.closeMobileMenus();
        }
    }
    
    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.pc-nav-item, .mobile-nav-menu__item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.startsWith(href) && href !== '/') {
                item.classList.add('active');
            } else if (href === '/' && currentPath === '/') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    
    showSecondaryNav(content) {
        const secondaryNav = document.querySelector('#secondaryNav');
        if (secondaryNav) {
            secondaryNav.innerHTML = content;
            secondaryNav.style.display = 'block';
        }
    }
    
    hideSecondaryNav() {
        const secondaryNav = document.querySelector('#secondaryNav');
        if (secondaryNav) {
            secondaryNav.style.display = 'none';
        }
    }
    
    updateBreadcrumb(items) {
        const breadcrumb = document.querySelector('.secondary-nav .breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = items.map((item, index) => {
                if (index === items.length - 1) {
                    return `<li class="breadcrumb-item active" aria-current="page">${item.text}</li>`;
                } else {
                    return `<li class="breadcrumb-item"><a href="${item.href}">${item.text}</a></li>`;
                }
            }).join('');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.flexJobsHeader = new FlexJobsHeader();
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlexJobsHeader;
}
