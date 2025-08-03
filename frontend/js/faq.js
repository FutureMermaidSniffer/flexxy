
class FAQManager {
    constructor() {
        this.searchInput = null;
        this.faqItems = [];
        this.init();
    }

    init() {
        
        this.setupSearch();
        
        
        this.collectFAQItems();
        
        
        this.setupAnalytics();
        
        
        this.setupChat();
    }

    setupSearch() {
        this.searchInput = document.getElementById('faqSearch');
        if (!this.searchInput) return;

        
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch(e.target.value);
            }
        });
    }

    collectFAQItems() {
        
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

        
        this.updateTabVisibility(hasResults);

        
        this.trackEvent('faq_search', { query: query, results_found: hasResults });
    }

    highlightText(item, query) {
        
        this.removeHighlights(item);

        
        const questionText = item.button.textContent;
        const highlightedQuestion = this.addHighlight(questionText, query);
        item.button.innerHTML = highlightedQuestion;

        
        const answerText = item.collapse.querySelector('.accordion-body').textContent;
        const highlightedAnswer = this.addHighlight(answerText, query);
        item.collapse.querySelector('.accordion-body').innerHTML = highlightedAnswer;
    }

    addHighlight(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    removeHighlights(item) {
        
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
        
        this.faqItems.forEach(item => {
            item.element.style.display = 'block';
            this.removeHighlights(item);
        });

        
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.style.display = 'block';
        });
    }

    updateTabVisibility(hasResults) {
        const tabPanes = document.querySelectorAll('.tab-pane');
        const tabs = document.querySelectorAll('[data-bs-toggle="pill"]');
        
        if (!hasResults) {
            
            this.showNoResults();
            return;
        } else {
            this.hideNoResults();
        }

        
        tabPanes.forEach((pane, index) => {
            const visibleItems = pane.querySelectorAll('.accordion-item[style*="block"], .accordion-item:not([style*="none"])');
            const tab = tabs[index];
            
            if (visibleItems.length === 0) {
                
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
        
        const accordionButtons = document.querySelectorAll('.accordion-button');
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.textContent.trim();
                this.trackEvent('faq_question_clicked', { question: question });
            });
        });

        
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
        
        
        
        this.trackEvent('live_chat_initiated', { source: 'faq_page' });
        
        
        alert('Live chat feature would be integrated here. For now, please use our contact form.');
        window.location.href = 'support.html';
    }

    trackEvent(eventName, data = {}) {
        
        console.log('Event tracked:', eventName, data);
        
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}


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
            
            
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
            
            
            document.querySelector('.faq-content').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const faqManager = new FAQManager();
    const faqSuggestions = new FAQSuggestions();
    
    
    window.faqManager = faqManager;
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAQManager, FAQSuggestions };
}
