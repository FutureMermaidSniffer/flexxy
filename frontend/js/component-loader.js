

class ComponentLoader {
    static loadedScripts = new Set();
    static loadedComponents = new Set();

    
    static async loadHeader() {
        const componentPath = 'components/main-header';
        const containerId = 'main-header-placeholder';
        
        try {
            
            if (this.loadedComponents.has('main-header')) {
                console.log('Header component already loaded');
                return;
            }

            
            await this.loadHTML(`${componentPath}/main-header.html`, containerId);
            
            
            await this.loadCSS(`${componentPath}/main-header.css`);
            
            
            await this.loadJS(`${componentPath}/main-header.js`);
            
            
            setTimeout(() => {
                if (typeof MainHeader !== 'undefined' && !window.mainHeaderInstance) {
                    window.mainHeaderInstance = new MainHeader();
                    console.log('MainHeader instance created by ComponentLoader');
                } else if (window.mainHeaderInstance) {
                    console.log('MainHeader instance already exists, skipping creation');
                }
                // Re-apply translations + bind language switcher after header inject
                if (window.i18n && typeof window.i18n.refresh === 'function') {
                    window.i18n.refresh();
                }
            }, 100);
            
            
            this.loadedComponents.add('main-header');

            // Site-wide support chat (also loaded from footer as fallback)
            await this.loadChatWidget();
            
            console.log('Header component loaded successfully');
            
        } catch (error) {
            console.error('Error loading header component:', error);
            throw error;
        }
    }

    
    static async loadFooter() {
        const componentPath = 'components/main-footer';
        const containerId = 'footer-placeholder';
        
        try {
            
            if (this.loadedComponents.has('main-footer')) {
                console.log('Footer component already loaded');
                return;
            }

            
            await this.loadHTML(`${componentPath}/main-footer.html`, containerId);
            
            
            await this.loadCSS(`${componentPath}/main-footer.css`);
            
            
            await this.loadJS(`${componentPath}/main-footer.js`);

            if (window.i18n && typeof window.i18n.refresh === 'function') {
                window.i18n.refresh();
            }
            
            
            this.loadedComponents.add('main-footer');

            // Site-wide support chat widget
            await this.loadChatWidget();
            
            console.log('Footer component loaded successfully');
            
        } catch (error) {
            console.error('Error loading footer component:', error);
            throw error;
        }
    }

    /**
     * Load floating chat widget (guests + registered users).
     */
    static async loadChatWidget() {
        if (document.body?.classList.contains('admin-dashboard')) return;
        if (this.loadedComponents.has('chat-widget')) return;

        try {
            await this.loadCSS('/css/chat-widget.css');
            await this.loadJS('/js/utils/client-info.js');
            await this.loadJS('/js/chat-widget.js');
            this.loadedComponents.add('chat-widget');
        } catch (error) {
            console.warn('Chat widget failed to load:', error.message);
        }
    }

    /** Notify i18n after any dynamic HTML insert */
    static refreshI18n() {
        if (window.i18n && typeof window.i18n.refresh === 'function') {
            window.i18n.refresh();
        }
    }

    
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

    
    static async loadCSS(cssPath) {
        
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

    
    static async loadJS(jsPath) {
        
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

    
    static isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    
    static reset() {
        this.loadedScripts.clear();
        this.loadedComponents.clear();
    }
}


window.ComponentLoader = ComponentLoader;


if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}
