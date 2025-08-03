
class TabManager {
    constructor() {
        this.init();
    }

    init() {
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTabs());
        } else {
            this.setupTabs();
        }
    }

    setupTabs() {
        
        const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateTab(button);
            });
        });

        
        const activeTab = document.querySelector('.nav-link.active[data-bs-toggle="pill"]');
        if (activeTab) {
            this.activateTab(activeTab, false);
        }
    }

    activateTab(clickedButton, animate = true) {
        const targetId = clickedButton.getAttribute('data-bs-target');
        const targetPane = document.querySelector(targetId);

        if (!targetPane) return;

        
        document.querySelectorAll('.nav-link[data-bs-toggle="pill"]').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        
        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');

        
        if (animate) {
            
            targetPane.classList.add('fade');
            setTimeout(() => {
                targetPane.classList.add('show', 'active');
            }, 10);
        } else {
            targetPane.classList.add('show', 'active');
        }

        
        const tabEvent = new CustomEvent('tab.shown', {
            detail: {
                target: targetPane,
                button: clickedButton
            }
        });
        document.dispatchEvent(tabEvent);
    }
}


const tabManager = new TabManager();
