// Bootstrap Tab Functionality - Lightweight Implementation
class TabManager {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTabs());
        } else {
            this.setupTabs();
        }
    }

    setupTabs() {
        // Find all tab buttons
        const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateTab(button);
            });
        });

        // Initialize first tab as active if none are active
        const activeTab = document.querySelector('.nav-link.active[data-bs-toggle="pill"]');
        if (activeTab) {
            this.activateTab(activeTab, false);
        }
    }

    activateTab(clickedButton, animate = true) {
        const targetId = clickedButton.getAttribute('data-bs-target');
        const targetPane = document.querySelector(targetId);

        if (!targetPane) return;

        // Remove active class from all tabs and panes
        document.querySelectorAll('.nav-link[data-bs-toggle="pill"]').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        // Add active class to clicked tab
        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');

        // Show target pane
        if (animate) {
            // Add fade effect
            targetPane.classList.add('fade');
            setTimeout(() => {
                targetPane.classList.add('show', 'active');
            }, 10);
        } else {
            targetPane.classList.add('show', 'active');
        }

        // Trigger custom event
        const tabEvent = new CustomEvent('tab.shown', {
            detail: {
                target: targetPane,
                button: clickedButton
            }
        });
        document.dispatchEvent(tabEvent);
    }
}

// Initialize tab management
const tabManager = new TabManager();
