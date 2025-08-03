/**
 * Component Loader - Handles loading of reusable components
 * Manages HTML/CSS/JS loading for header and footer components
 */

class ComponentLoader {
    static loadedScripts = new Set();
    static loadedComponents = new Set();

    /**
     * Load header component with HTML, CSS, and JS
     */
    static async loadHeader() {
        const componentPath = 'components/main-header';
        const containerId = 'main-header-placeholder';
        
        try {
            // Check if already loaded
            if (this.loadedComponents.has('main-header')) {
                console.log('Header component already loaded');
                return;
            }

            // Load HTML
            await this.loadHTML(`${componentPath}/main-header.html`, containerId);
            
            // Load CSS (if not already loaded)
            await this.loadCSS(`${componentPath}/main-header.css`);
            
            // Load JS (if not already loaded)
            await this.loadJS(`${componentPath}/main-header.js`);
            
            // Load unified search functionality
            await this.loadJS('js/unified-search.js');
            
            // Initialize MainHeader component (prevent duplicates)
            setTimeout(() => {
                if (typeof MainHeader !== 'undefined' && !window.mainHeaderInstance) {
                    window.mainHeaderInstance = new MainHeader();
                    console.log('MainHeader instance created by ComponentLoader');
                } else if (window.mainHeaderInstance) {
                    console.log('MainHeader instance already exists, skipping creation');
                }
            }, 100);
            
            // Mark as loaded
            this.loadedComponents.add('main-header');
            
            console.log('Header component loaded successfully');
            
        } catch (error) {
            console.error('Error loading header component:', error);
            throw error;
        }
    }

    /**
     * Load footer component with HTML, CSS, and JS
     */
    static async loadFooter() {
        const componentPath = 'components/main-footer';
        const containerId = 'footer-placeholder';
        
        try {
            // Check if already loaded
            if (this.loadedComponents.has('main-footer')) {
                console.log('Footer component already loaded');
                return;
            }

            // Load HTML
            await this.loadHTML(`${componentPath}/main-footer.html`, containerId);
            
            // Load CSS (if not already loaded)
            await this.loadCSS(`${componentPath}/main-footer.css`);
            
            // Load JS (if not already loaded)
            await this.loadJS(`${componentPath}/main-footer.js`);
            
            // Mark as loaded
            this.loadedComponents.add('main-footer');
            
            console.log('Footer component loaded successfully');
            
        } catch (error) {
            console.error('Error loading footer component:', error);
            throw error;
        }
    }

    /**
     * Load HTML content into a container
     */
    static async loadHTML(htmlPath, containerId) {
        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`Failed to load HTML: ${htmlPath} (${response.status})`);
        }
        
        const html = await response.text();
        const container = document.getElementById(containerId);
        
        if (!container) {
            throw new Error(`Container not found: ${containerId}`);
        }
        
        container.innerHTML = html;
    }

    /**
     * Load CSS file (avoid duplicates)
     */
    static async loadCSS(cssPath) {
        // Check if CSS is already loaded
        if (document.querySelector(`link[href="${cssPath}"]`)) {
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            
            link.onload = () => {
                console.log(`CSS loaded: ${cssPath}`);
                resolve();
            };
            
            link.onerror = () => {
                console.error(`Failed to load CSS: ${cssPath}`);
                reject(new Error(`Failed to load CSS: ${cssPath}`));
            };
            
            document.head.appendChild(link);
        });
    }

    /**
     * Load JavaScript file (avoid duplicates and redeclarations)
     */
    static async loadJS(jsPath) {
        // Check if script is already loaded
        if (this.loadedScripts.has(jsPath)) {
            console.log(`Script already loaded: ${jsPath}`);
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = jsPath;
            script.type = 'text/javascript';
            
            script.onload = () => {
                console.log(`Script loaded: ${jsPath}`);
                this.loadedScripts.add(jsPath);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`Failed to load script: ${jsPath}`);
                reject(new Error(`Failed to load script: ${jsPath}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Check if a component is loaded
     */
    static isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * Reset loaded components (for testing/debugging)
     */
    static reset() {
        this.loadedScripts.clear();
        this.loadedComponents.clear();
    }
}

// Make ComponentLoader globally available
window.ComponentLoader = ComponentLoader;

// Also export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}
