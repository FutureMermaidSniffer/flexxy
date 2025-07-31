// Component Loader - Handles loading of header and footer components
class ComponentLoader {
    static async loadHeader() {
        try {
            const response = await fetch('components/main-header/main-header.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.text();
            const headerPlaceholder = document.getElementById('main-header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            }
            
            // Load header CSS
            await ComponentLoader.loadCSS('components/main-header/main-header.css', 'Header CSS');
            
            // Load header JavaScript
            await ComponentLoader.loadJS('components/main-header/main-header.js', 'Header JS');
            
        } catch (error) {
            console.error('Error loading header:', error);
            ComponentLoader.loadFallbackHeader();
        }
    }

    static async loadFooter() {
        try {
            const response = await fetch('components/main-footer/main-footer.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.text();
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
            
        } catch (error) {
            console.error('Error loading footer:', error);
            ComponentLoader.loadFallbackFooter();
        }
    }

    static loadCSS(href, description = 'CSS') {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = function() {
                console.log(`${description} loaded successfully`);
                resolve();
            };
            link.onerror = function() {
                console.error(`Failed to load ${description}`);
                reject(new Error(`Failed to load ${description}`));
            };
            document.head.appendChild(link);
        });
    }

    static loadJS(src, description = 'JavaScript') {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = function() {
                console.log(`${description} loaded successfully`);
                resolve();
            };
            script.onerror = function() {
                console.error(`Failed to load ${description}`);
                reject(new Error(`Failed to load ${description}`));
            };
            document.body.appendChild(script);
        });
    }

    static loadFallbackHeader() {
        const headerPlaceholder = document.getElementById('main-header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = `
                <header class="main-header" style="background: #fff; padding: 1rem 0; border-bottom: 1px solid #dee2e6;">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <img src="images/FlexJobs_logo-1.png" alt="FlexJobs" style="height: 40px;">
                            </div>
                            <div class="col text-end">
                                <a href="index.html" class="btn btn-outline-primary btn-sm">Home</a>
                            </div>
                        </div>
                    </div>
                </header>
            `;
        }
    }

    static loadFallbackFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = `
                <footer style="background: #f8f9fa; padding: 2rem 0; margin-top: 3rem; border-top: 1px solid #dee2e6;">
                    <div class="container text-center">
                        <p class="mb-0">&copy; 2025 FlexJobs. All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
    }

    // Initialize component loading when DOM is ready
    static init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                ComponentLoader.loadHeader();
                ComponentLoader.loadFooter();
            });
        } else {
            ComponentLoader.loadHeader();
            ComponentLoader.loadFooter();
        }
    }
}

// Auto-initialize when script loads
ComponentLoader.init();
