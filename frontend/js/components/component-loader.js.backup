/**
 * Component Loader Utility
 * Dynamically loads header and footer components with error handling and fallbacks
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loadingStates = new Map();
        this.cache = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        // Configuration
        this.config = {
            basePath: '/components',
            timeout: 5000,
            enableCache: true,
            enableFallbacks: true
        };
    }

    /**
     * Load all components (header and footer)
     */
    async loadComponents() {
        console.log('🚀 Loading FlexJobs components...');
        
        try {
            // Load components in parallel
            const promises = [
                this.loadComponent('header', 'header-container'),
                this.loadComponent('footer', 'footer-container')
            ];
            
            const results = await Promise.allSettled(promises);
            
            // Check results
            const headerResult = results[0];
            const footerResult = results[1];
            
            if (headerResult.status === 'rejected') {
                console.error('❌ Header component failed to load:', headerResult.reason);
                this.createFallbackHeader();
            } else {
                console.log('✅ Header component loaded successfully');
            }
            
            if (footerResult.status === 'rejected') {
                console.error('❌ Footer component failed to load:', footerResult.reason);
                this.createFallbackFooter();
            } else {
                console.log('✅ Footer component loaded successfully');
            }
            
            // Initialize components after loading
            this.initializeComponents();
            
            return {
                header: headerResult.status === 'fulfilled',
                footer: footerResult.status === 'fulfilled'
            };
            
        } catch (error) {
            console.error('❌ Critical error loading components:', error);
            this.createFallbackComponents();
            return { header: false, footer: false };
        }
    }

    /**
     * Load a specific component
     */
    async loadComponent(componentName, containerId) {
        const startTime = performance.now();
        
        try {
            // Check if component is already loading
            if (this.loadingStates.get(componentName)) {
                console.log(`⏳ ${componentName} already loading, waiting...`);
                return await this.loadingStates.get(componentName);
            }
            
            // Check cache first
            if (this.config.enableCache && this.cache.has(componentName)) {
                console.log(`📦 Loading ${componentName} from cache`);
                const cachedHTML = this.cache.get(componentName);
                return this.injectComponent(componentName, containerId, cachedHTML);
            }
            
            // Create loading promise
            const loadingPromise = this.fetchComponent(componentName);
            this.loadingStates.set(componentName, loadingPromise);
            
            const html = await loadingPromise;
            
            // Cache the HTML
            if (this.config.enableCache) {
                this.cache.set(componentName, html);
            }
            
            // Inject into DOM
            await this.injectComponent(componentName, containerId, html);
            
            const loadTime = performance.now() - startTime;
            console.log(`✅ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
            
            // Clear loading state
            this.loadingStates.delete(componentName);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error loading ${componentName}:`, error);
            this.loadingStates.delete(componentName);
            
            // Retry logic
            const retryCount = this.retryAttempts.get(componentName) || 0;
            if (retryCount < this.maxRetries) {
                console.log(`🔄 Retrying ${componentName} (attempt ${retryCount + 1}/${this.maxRetries})`);
                this.retryAttempts.set(componentName, retryCount + 1);
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.loadComponent(componentName, containerId);
            }
            
            throw error;
        }
    }

    /**
     * Fetch component HTML from server
     */
    async fetchComponent(componentName) {
        const url = `${this.config.basePath}/${componentName}/${componentName}.html`;
        
        console.log(`🔗 Fetching ${componentName} from ${url}`);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                cache: 'no-cache',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            
            if (!html.trim()) {
                throw new Error(`Empty response for ${componentName}`);
            }
            
            return html;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Timeout loading ${componentName} after ${this.config.timeout}ms`);
            }
            
            throw error;
        }
    }

    /**
     * Inject component HTML into DOM
     */
    async injectComponent(componentName, containerId, html) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            throw new Error(`Container element #${containerId} not found`);
        }
        
        // Show loading state
        container.innerHTML = this.createLoadingHTML(componentName);
        
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Inject the component
        container.innerHTML = html;
        
        // Add loaded class for CSS animations
        container.classList.add('component-loaded');
        
        // Store component reference
        this.components.set(componentName, container);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent(`${componentName}Loaded`, {
            detail: { componentName, containerId, loadTime: Date.now() }
        }));
        
        return true;
    }

    /**
     * Create loading HTML
     */
    createLoadingHTML(componentName) {
        if (componentName === 'header') {
            return `
                <div class="component-loading header-loading">
                    <div class="container">
                        <div class="d-flex justify-content-between align-items-center py-3">
                            <div class="loading-skeleton loading-logo"></div>
                            <div class="d-flex gap-3">
                                <div class="loading-skeleton loading-nav-item"></div>
                                <div class="loading-skeleton loading-nav-item"></div>
                                <div class="loading-skeleton loading-nav-item"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (componentName === 'footer') {
            return `
                <div class="component-loading footer-loading">
                    <div class="container py-4">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="loading-skeleton loading-footer-title"></div>
                                <div class="loading-skeleton loading-footer-text"></div>
                            </div>
                            <div class="col-md-3">
                                <div class="loading-skeleton loading-footer-title"></div>
                                <div class="loading-skeleton loading-footer-text"></div>
                            </div>
                            <div class="col-md-3">
                                <div class="loading-skeleton loading-footer-title"></div>
                                <div class="loading-skeleton loading-footer-text"></div>
                            </div>
                            <div class="col-md-3">
                                <div class="loading-skeleton loading-footer-title"></div>
                                <div class="loading-skeleton loading-footer-text"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="component-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading ${componentName}...</span>
                </div>
            </div>
        `;
    }

    /**
     * Initialize components after loading
     */
    initializeComponents() {
        setTimeout(() => {
            // Initialize header
            if (window.headerInstance && typeof window.headerInstance.updateActiveNav === 'function') {
                window.headerInstance.updateActiveNav();
                console.log('🎯 Header component initialized');
            }
            
            // Initialize footer
            if (window.footerInstance) {
                console.log('🎯 Footer component initialized');
            }
            
            // Set active navigation based on current page
            this.setActiveNavigationFromURL();
            
            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('componentsInitialized', {
                detail: { timestamp: Date.now() }
            }));
            
        }, 100);
    }

    /**
     * Set active navigation based on current URL
     */
    setActiveNavigationFromURL() {
        const path = window.location.pathname;
        let activePage = '';
        
        if (path.includes('remote-jobs') || path === '/') {
            activePage = 'remote-jobs';
        } else if (path.includes('about')) {
            activePage = 'about';
        } else if (path.includes('job-search-career-advice') || path.includes('career-advice')) {
            activePage = 'career-advice';
        } else if (path.includes('events')) {
            activePage = 'events';
        } else if (path.includes('blog')) {
            activePage = 'blog';
        }
        
        if (activePage && window.headerInstance && typeof window.headerInstance.setActiveNav === 'function') {
            window.headerInstance.setActiveNav(activePage);
            console.log(`🔗 Set active navigation: ${activePage}`);
        }
    }

    /**
     * Create fallback components if loading fails
     */
    createFallbackComponents() {
        if (this.config.enableFallbacks) {
            this.createFallbackHeader();
            this.createFallbackFooter();
        }
    }

    /**
     * Create fallback header
     */
    createFallbackHeader() {
        const container = document.getElementById('header-container');
        if (!container) return;
        
        console.log('🔧 Creating fallback header');
        
        container.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark fallback-header">
                <div class="container">
                    <a class="navbar-brand fw-bold" href="/">
                        <i class="fas fa-briefcase me-2"></i>
                        FlexJobs
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/remote-jobs">Remote Jobs</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/job-search-career-advice">Career Advice</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/events">Events</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/blog">Blog</a>
                            </li>
                        </ul>
                        
                        <div class="navbar-nav">
                            <a class="nav-link" href="/login">Login</a>
                            <a class="nav-link btn btn-outline-warning ms-2" href="/signup">Sign Up</a>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        container.classList.add('component-loaded', 'fallback-component');
    }

    /**
     * Create fallback footer
     */
    createFallbackFooter() {
        const container = document.getElementById('footer-container');
        if (!container) return;
        
        console.log('🔧 Creating fallback footer');
        
        container.innerHTML = `
            <footer class="bg-dark text-light py-5 fallback-footer">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 mb-4">
                            <h5 class="fw-bold mb-3">
                                <i class="fas fa-briefcase me-2"></i>
                                FlexJobs
                            </h5>
                            <p class="text-muted">
                                Find remote, flexible, and part-time jobs with FlexJobs. 
                                Your gateway to a better work-life balance.
                            </p>
                        </div>
                        
                        <div class="col-lg-2 col-md-3 mb-4">
                            <h6 class="fw-bold mb-3">Jobs</h6>
                            <ul class="list-unstyled">
                                <li><a href="/remote-jobs" class="text-muted text-decoration-none">Remote Jobs</a></li>
                                <li><a href="/part-time-jobs" class="text-muted text-decoration-none">Part-time Jobs</a></li>
                                <li><a href="/freelance-jobs" class="text-muted text-decoration-none">Freelance Jobs</a></li>
                            </ul>
                        </div>
                        
                        <div class="col-lg-2 col-md-3 mb-4">
                            <h6 class="fw-bold mb-3">Company</h6>
                            <ul class="list-unstyled">
                                <li><a href="/about" class="text-muted text-decoration-none">About</a></li>
                                <li><a href="/events" class="text-muted text-decoration-none">Events</a></li>
                                <li><a href="/blog" class="text-muted text-decoration-none">Blog</a></li>
                            </ul>
                        </div>
                        
                        <div class="col-lg-2 col-md-3 mb-4">
                            <h6 class="fw-bold mb-3">Resources</h6>
                            <ul class="list-unstyled">
                                <li><a href="/job-search-career-advice" class="text-muted text-decoration-none">Career Advice</a></li>
                                <li><a href="/help" class="text-muted text-decoration-none">Help Center</a></li>
                                <li><a href="/contact" class="text-muted text-decoration-none">Contact</a></li>
                            </ul>
                        </div>
                        
                        <div class="col-lg-2 col-md-3 mb-4">
                            <h6 class="fw-bold mb-3">Follow Us</h6>
                            <div class="d-flex gap-2">
                                <a href="#" class="text-muted"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="text-muted"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="text-muted"><i class="fab fa-linkedin-in"></i></a>
                                <a href="#" class="text-muted"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="border-secondary">
                    
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="d-flex gap-3">
                                <a href="/privacy" class="text-muted text-decoration-none small">Privacy Policy</a>
                                <a href="/terms" class="text-muted text-decoration-none small">Terms of Service</a>
                                <a href="/cookies" class="text-muted text-decoration-none small">Cookie Policy</a>
                            </div>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <p class="text-muted small mb-0">
                                &copy; 2024 FlexJobs. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        
        container.classList.add('component-loaded', 'fallback-component');
    }

    /**
     * Reload a specific component
     */
    async reloadComponent(componentName) {
        console.log(`🔄 Reloading ${componentName} component`);
        
        // Clear cache
        this.cache.delete(componentName);
        this.retryAttempts.delete(componentName);
        
        // Determine container ID
        const containerId = componentName === 'header' ? 'header-container' : 'footer-container';
        
        try {
            await this.loadComponent(componentName, containerId);
            this.initializeComponents();
            return true;
        } catch (error) {
            console.error(`Failed to reload ${componentName}:`, error);
            return false;
        }
    }

    /**
     * Get component loading status
     */
    getComponentStatus(componentName) {
        return {
            loaded: this.components.has(componentName),
            loading: this.loadingStates.has(componentName),
            cached: this.cache.has(componentName),
            retryCount: this.retryAttempts.get(componentName) || 0
        };
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        this.retryAttempts.clear();
        console.log('🧹 Component cache cleared');
    }

    /**
     * Preload components (for performance)
     */
    async preloadComponents() {
        console.log('⚡ Preloading components...');
        
        try {
            const promises = [
                this.fetchComponent('header'),
                this.fetchComponent('footer')
            ];
            
            const results = await Promise.allSettled(promises);
            
            results.forEach((result, index) => {
                const componentName = index === 0 ? 'header' : 'footer';
                if (result.status === 'fulfilled') {
                    this.cache.set(componentName, result.value);
                    console.log(`✅ ${componentName} preloaded`);
                } else {
                    console.warn(`⚠️ Failed to preload ${componentName}:`, result.reason);
                }
            });
            
        } catch (error) {
            console.error('❌ Error preloading components:', error);
        }
    }
}

// CSS for loading states and fallbacks
const componentLoaderStyles = `
    .component-loading {
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border: 1px dashed #dee2e6;
        margin: 1rem 0;
        border-radius: 8px;
    }
    
    .header-loading {
        min-height: 80px;
        background: #212529;
    }
    
    .footer-loading {
        min-height: 200px;
        background: #212529;
    }
    
    .loading-skeleton {
        background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
        border-radius: 4px;
    }
    
    .loading-logo {
        width: 120px;
        height: 30px;
    }
    
    .loading-nav-item {
        width: 80px;
        height: 20px;
    }
    
    .loading-footer-title {
        width: 80%;
        height: 20px;
        margin-bottom: 10px;
    }
    
    .loading-footer-text {
        width: 90%;
        height: 16px;
        margin-bottom: 8px;
    }
    
    .component-loaded {
        animation: fadeInUp 0.3s ease-out;
    }
    
    .fallback-component {
        border-left: 4px solid #ffc107;
    }
    
    @keyframes loading-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Inject CSS
if (!document.querySelector('#component-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'component-loader-styles';
    style.textContent = componentLoaderStyles;
    document.head.appendChild(style);
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Global convenience function
window.loadComponents = function() {
    return window.componentLoader.loadComponents();
};

// Preload components on page load for better performance
if (document.readyState !== 'loading') {
    window.componentLoader.preloadComponents();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentLoader.preloadComponents();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}

console.log('🎯 Component Loader initialized');
