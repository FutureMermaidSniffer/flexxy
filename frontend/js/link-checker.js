

class LinkChecker {
    constructor() {
        this.checkedLinks = new Set();
        this.brokenLinks = new Set();
        this.init();
    }

    init() {
        this.monitorPageLinks();
        this.handleNavigation();
        this.setupErrorHandlers();
    }

    
    monitorPageLinks() {
        
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAllLinks();
        });

        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
                        links.forEach(link => this.checkLink(link));
                        
                        if (node.tagName === 'A' && node.href) {
                            this.checkLink(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    
    checkAllLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => this.checkLink(link));
    }

    
    async checkLink(link) {
        const href = link.href;
        
        
        if (!this.isInternalLink(href)) {
            return;
        }

        
        if (this.checkedLinks.has(href)) {
            if (this.brokenLinks.has(href)) {
                this.markAsBroken(link);
            }
            return;
        }

        this.checkedLinks.add(href);

        try {
            const response = await fetch(href, { method: 'HEAD' });
            
            if (response.status === 404) {
                this.brokenLinks.add(href);
                this.markAsBroken(link);
                this.logBrokenLink(href, link);
            }
        } catch (error) {
            
            console.warn('Link check failed:', href, error.message);
        }
    }

    
    isInternalLink(href) {
        try {
            const url = new URL(href);
            const currentDomain = window.location.hostname;
            
            
            return url.hostname === currentDomain || href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
        } catch (error) {
            
            return false;
        }
    }

    
    markAsBroken(link) {
        link.classList.add('broken-link');
        link.title = 'This link appears to be broken';
        
        
        if (!link.querySelector('.broken-link-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'broken-link-indicator';
            indicator.innerHTML = ' ⚠️';
            indicator.title = 'Broken link';
            link.appendChild(indicator);
        }
    }

    
    handleNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            
            if (link && this.isInternalLink(link.href)) {
                
                if (this.brokenLinks.has(link.href)) {
                    e.preventDefault();
                    this.redirectTo404(link.href);
                    return;
                }

                
                this.quickCheckAndNavigate(link, e);
            }
        });
    }

    
    async quickCheckAndNavigate(link, event) {
        const href = link.href;
        
        
        if (this.checkedLinks.has(href) && !this.brokenLinks.has(href)) {
            return;
        }

        
        if (!this.checkedLinks.has(href)) {
            event.preventDefault();
            
            try {
                const response = await fetch(href, { method: 'HEAD' });
                
                if (response.status === 404) {
                    this.brokenLinks.add(href);
                    this.redirectTo404(href);
                } else {
                    this.checkedLinks.add(href);
                    
                    window.location.href = href;
                }
            } catch (error) {
                
                
                window.location.href = href;
            }
        }
    }

    
    redirectTo404(originalUrl) {
        
        sessionStorage.setItem('flexjobs_broken_link', originalUrl);
        sessionStorage.setItem('flexjobs_referrer', window.location.href);
        
        
        window.location.href = '/404.html';
    }

    
    logBrokenLink(href, linkElement) {
        const logData = {
            brokenUrl: href,
            currentPage: window.location.href,
            linkText: linkElement.textContent.trim(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        
        try {
            const brokenLinks = JSON.parse(localStorage.getItem('flexjobs_broken_links') || '[]');
            brokenLinks.push(logData);
            
            
            if (brokenLinks.length > 50) {
                brokenLinks.splice(0, brokenLinks.length - 50);
            }
            
            localStorage.setItem('flexjobs_broken_links', JSON.stringify(brokenLinks));
        } catch (error) {
            console.warn('Could not store broken link data:', error);
        }

        console.warn('Broken link detected:', logData);
    }

    
    setupErrorHandlers() {
        
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);

        
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason && e.reason.message && e.reason.message.includes('404')) {
                console.warn('Navigation promise rejection:', e.reason);
            }
        });
    }

    
    handleImageError(img) {
        img.classList.add('broken-image');
        img.alt = img.alt || 'Image not found';
        img.title = 'Image could not be loaded';
        
        
        if (!img.src.includes('placeholder')) {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        }
    }

    
    getBrokenLinksReport() {
        try {
            const brokenLinks = JSON.parse(localStorage.getItem('flexjobs_broken_links') || '[]');
            return {
                total: brokenLinks.length,
                links: brokenLinks,
                currentPageBroken: Array.from(this.brokenLinks)
            };
        } catch (error) {
            return { total: 0, links: [], currentPageBroken: [] };
        }
    }

    
    clearCache() {
        this.checkedLinks.clear();
        this.brokenLinks.clear();
        localStorage.removeItem('flexjobs_broken_links');
    }
}


const brokenLinkStyles = `
    .broken-link {
        color: #dc3545 !important;
        text-decoration: line-through !important;
        position: relative;
    }
    
    .broken-link:hover {
        color: #a71e2a !important;
    }
    
    .broken-link-indicator {
        font-size: 0.8em;
        opacity: 0.7;
    }
    
    .broken-image {
        border: 2px dashed #dc3545;
        opacity: 0.5;
        background-color: #f8f9fa;
    }
`;


const styleSheet = document.createElement('style');
styleSheet.textContent = brokenLinkStyles;
document.head.appendChild(styleSheet);


const linkChecker = new LinkChecker();


if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkChecker;
}


window.linkChecker = linkChecker;
