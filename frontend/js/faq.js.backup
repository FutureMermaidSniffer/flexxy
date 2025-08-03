// FAQ Page JavaScript
class FAQManager {
    constructor() {
        this.searchInput = null;
        this.faqItems = [];
        this.init();
    }

    init() {
        // Initialize search functionality
        this.setupSearch();
        
        // Collect all FAQ items for searching
        this.collectFAQItems();
        
        // Setup analytics tracking
        this.setupAnalytics();
        
        // Setup chat functionality
        this.setupChat();
    }

    setupSearch() {
        this.searchInput = document.getElementById('faqSearch');
        if (!this.searchInput) return;

        // Add search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Handle enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch(e.target.value);
            }
        });
    }

    collectFAQItems() {
        // Collect all FAQ items for search functionality
        const accordionItems = document.querySelectorAll('.accordion-item');
        
        this.faqItems = Array.from(accordionItems).map(item => {
            const button = item.querySelector('.accordion-button');
            const body = item.querySelector('.accordion-body');
            
            return {
                element: item,
                question: button ? button.textContent.trim() : '',
                answer: body ? body.textContent.trim() : '',
                button: button,
                collapse: item.querySelector('.accordion-collapse')
            };
        });
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearch();
            return;
        }

        query = query.toLowerCase();
        let hasResults = false;

        // Filter FAQ items based on search query
        this.faqItems.forEach(item => {
            const questionMatch = item.question.toLowerCase().includes(query);
            const answerMatch = item.answer.toLowerCase().includes(query);
            
            if (questionMatch || answerMatch) {
                item.element.style.display = 'block';
                this.highlightText(item, query);
                hasResults = true;
            } else {
                item.element.style.display = 'none';
            }
        });

        // Show/hide tab panels based on results
        this.updateTabVisibility(hasResults);

        // Track search
        this.trackEvent('faq_search', { query: query, results_found: hasResults });
    }

    highlightText(item, query) {
        // Remove existing highlights
        this.removeHighlights(item);

        // Highlight question
        const questionText = item.button.textContent;
        const highlightedQuestion = this.addHighlight(questionText, query);
        item.button.innerHTML = highlightedQuestion;

        // Highlight answer
        const answerText = item.collapse.querySelector('.accordion-body').textContent;
        const highlightedAnswer = this.addHighlight(answerText, query);
        item.collapse.querySelector('.accordion-body').innerHTML = highlightedAnswer;
    }

    addHighlight(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    removeHighlights(item) {
        // Reset to original text content
        const button = item.button;
        const body = item.collapse.querySelector('.accordion-body');
        
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        } else {
            button.dataset.originalText = button.textContent;
        }

        if (body.dataset.originalText) {
            body.textContent = body.dataset.originalText;
        } else {
            body.dataset.originalText = body.textContent;
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    clearSearch() {
        // Show all FAQ items
        this.faqItems.forEach(item => {
            item.element.style.display = 'block';
            this.removeHighlights(item);
        });

        // Show all tab panels
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.style.display = 'block';
        });
    }

    updateTabVisibility(hasResults) {
        const tabPanes = document.querySelectorAll('.tab-pane');
        const tabs = document.querySelectorAll('[data-bs-toggle="pill"]');
        
        if (!hasResults) {
            // Show "no results" message
            this.showNoResults();
            return;
        } else {
            this.hideNoResults();
        }

        // Check each tab panel for visible items
        tabPanes.forEach((pane, index) => {
            const visibleItems = pane.querySelectorAll('.accordion-item[style*="block"], .accordion-item:not([style*="none"])');
            const tab = tabs[index];
            
            if (visibleItems.length === 0) {
                // Hide empty tab panels during search
                pane.style.display = 'none';
                if (tab) {
                    tab.style.opacity = '0.5';
                    tab.style.pointerEvents = 'none';
                }
            } else {
                pane.style.display = 'block';
                if (tab) {
                    tab.style.opacity = '1';
                    tab.style.pointerEvents = 'auto';
                }
            }
        });
    }

    showNoResults() {
        let noResultsDiv = document.getElementById('noSearchResults');
        
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.id = 'noSearchResults';
            noResultsDiv.className = 'text-center py-5';
            noResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No results found</h4>
                    <p class="text-muted">Try different keywords or browse our categories above.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('faqSearch').value = ''; document.querySelector('.faq-manager').clearSearch();">
                        Clear Search
                    </button>
                </div>
            `;
            
            document.querySelector('.faq-content .container .row .col-lg-10').appendChild(noResultsDiv);
        }
        
        noResultsDiv.style.display = 'block';
    }

    hideNoResults() {
        const noResultsDiv = document.getElementById('noSearchResults');
        if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }

    setupAnalytics() {
        // Track accordion interactions
        const accordionButtons = document.querySelectorAll('.accordion-button');
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.textContent.trim();
                this.trackEvent('faq_question_clicked', { question: question });
            });
        });

        // Track tab switching
        const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const category = e.target.getAttribute('data-bs-target').replace('#', '');
                this.trackEvent('faq_category_viewed', { category: category });
            });
        });
    }

    setupChat() {
        const chatButton = document.getElementById('startChat');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                this.startLiveChat();
            });
        }
    }

    startLiveChat() {
        // In a real implementation, this would integrate with a chat service
        // For now, we'll show a modal or redirect to support
        
        this.trackEvent('live_chat_initiated', { source: 'faq_page' });
        
        // Show a modal or redirect to support page
        alert('Live chat feature would be integrated here. For now, please use our contact form.');
        window.location.href = 'support.html';
    }

    trackEvent(eventName, data = {}) {
        // Track user events for analytics
        console.log('Event tracked:', eventName, data);
        
        // In a real app, this would send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}

// Popular FAQ suggestions
class FAQSuggestions {
    constructor() {
        this.popularQuestions = [
            'How much does FlexJobs cost?',
            'How do I cancel my subscription?',
            'What types of jobs are available?',
            'How do I search for jobs?',
            'Do you offer refunds?'
        ];
        
        this.init();
    }

    init() {
        this.addSuggestions();
    }

    addSuggestions() {
        const searchContainer = document.querySelector('.faq-search');
        if (!searchContainer) return;

        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'search-suggestions mt-3';
        suggestionsDiv.innerHTML = `
            <small class="text-white-50 d-block mb-2">Popular questions:</small>
            <div class="suggestion-tags">
                ${this.popularQuestions.map(question => 
                    `<button class="btn btn-outline-light btn-sm me-2 mb-2 suggestion-tag" data-question="${question}">
                        ${question}
                    </button>`
                ).join('')}
            </div>
        `;

        searchContainer.appendChild(suggestionsDiv);

        // Add click handlers for suggestions
        const suggestionTags = suggestionsDiv.querySelectorAll('.suggestion-tag');
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const question = tag.dataset.question;
                this.searchForQuestion(question);
            });
        });
    }

    searchForQuestion(question) {
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.value = question;
            
            // Trigger search
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
            
            // Scroll to results
            document.querySelector('.faq-content').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const faqManager = new FAQManager();
    const faqSuggestions = new FAQSuggestions();
    
    // Make faqManager available globally for clear search button
    window.faqManager = faqManager;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAQManager, FAQSuggestions };
}
