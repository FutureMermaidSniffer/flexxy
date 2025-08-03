

class Error404Page {
    constructor() {
        this.init();
    }

    init() {
        this.initSearchForm();
        this.initRecentActivity();
        this.initErrorTracking();
        this.initHelpfulSuggestions();
        this.initBackgroundAnimation();
    }

    
    initSearchForm() {
        const searchForm = document.getElementById('errorSearchForm');
        const searchInput = document.getElementById('errorSearchInput');

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(searchInput.value.trim());
            });

            
            searchInput.addEventListener('input', (e) => {
                this.handleAutoSuggest(e.target.value.trim());
            });
        }
    }

    
    handleSearch(query) {
        if (!query) {
            this.showMessage('Please enter a search term.', 'warning');
            return;
        }

        
        this.trackErrorPageSearch(query);

        
        const searchUrl = `job-search-results.html?q=${encodeURIComponent(query)}&from=404`;
        window.location.href = searchUrl;
    }

    
    handleAutoSuggest(query) {
        if (query.length < 2) return;

        
        const suggestions = this.getSearchSuggestions(query);
        this.displaySuggestions(suggestions);
    }

    
    getSearchSuggestions(query) {
        const commonSearches = [
            'remote developer jobs',
            'data analyst remote',
            'customer service remote',
            'marketing manager remote',
            'virtual assistant',
            'content writer remote',
            'graphic designer freelance',
            'project manager remote',
            'sales representative remote',
            'social media manager'
        ];

        return commonSearches
            .filter(search => search.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
    }

    
    displaySuggestions(suggestions) {
        let suggestionContainer = document.getElementById('searchSuggestions');
        
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.id = 'searchSuggestions';
            suggestionContainer.className = 'error-404__suggestions';
            
            const searchForm = document.getElementById('errorSearchForm');
            searchForm.parentNode.insertBefore(suggestionContainer, searchForm.nextSibling);
        }

        if (suggestions.length === 0) {
            suggestionContainer.style.display = 'none';
            return;
        }

        suggestionContainer.innerHTML = suggestions
            .map(suggestion => `
                <div class="error-404__suggestion-item" data-suggestion="${suggestion}">
                    <i class="fas fa-search me-2"></i>
                    ${suggestion}
                </div>
            `).join('');

        suggestionContainer.style.display = 'block';

        
        suggestionContainer.querySelectorAll('.error-404__suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.getAttribute('data-suggestion');
                document.getElementById('errorSearchInput').value = suggestion;
                this.handleSearch(suggestion);
            });
        });
    }

    
    initRecentActivity() {
        const recentActivity = this.getRecentActivity();
        
        if (recentActivity.length > 0) {
            this.displayRecentActivity(recentActivity);
        }
    }

    
    getRecentActivity() {
        try {
            const recent = localStorage.getItem('flexjobs_recent_activity');
            return recent ? JSON.parse(recent) : [];
        } catch (error) {
            console.warn('Could not load recent activity:', error);
            return [];
        }
    }

    
    displayRecentActivity(activities) {
        const recentSection = document.getElementById('recentActivity');
        const recentList = document.getElementById('recentList');

        if (!recentSection || !recentList) return;

        recentList.innerHTML = activities
            .slice(0, 5) 
            .map(activity => `
                <div class="error-404__recent-item">
                    <a href="${activity.url}" class="error-404__recent-link">
                        <i class="${activity.icon} me-2"></i>
                        ${activity.title}
                    </a>
                    <div class="error-404__recent-time">
                        ${this.formatTimeAgo(activity.timestamp)}
                    </div>
                </div>
            `).join('');

        recentSection.style.display = 'block';
    }

    
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else {
            return `${days} days ago`;
        }
    }

    
    initErrorTracking() {
        
        this.track404Error();
        
        
        this.trackReferrer();
        
        
        this.startTimeTracking();
    }

    
    track404Error() {
        const errorData = {
            url: window.location.href,
            timestamp: Date.now(),
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        
        try {
            const errors = JSON.parse(localStorage.getItem('flexjobs_404_errors') || '[]');
            errors.push(errorData);
            
            
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('flexjobs_404_errors', JSON.stringify(errors));
        } catch (error) {
            console.warn('Could not store 404 error data:', error);
        }

        
        console.log('404 Error tracked:', errorData);
    }

    
    trackReferrer() {
        const referrer = document.referrer;
        if (referrer) {
            console.log('404 Error - Referred from:', referrer);
        }
    }

    
    startTimeTracking() {
        this.startTime = Date.now();
        
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - this.startTime;
            console.log('Time spent on 404 page:', Math.round(timeSpent / 1000), 'seconds');
        });
    }

    
    trackErrorPageSearch(query) {
        const searchData = {
            query: query,
            timestamp: Date.now(),
            page: '404'
        };

        console.log('404 Page search:', searchData);
        
        
        try {
            const searches = JSON.parse(localStorage.getItem('flexjobs_404_searches') || '[]');
            searches.push(searchData);
            
            
            if (searches.length > 20) {
                searches.splice(0, searches.length - 20);
            }
            
            localStorage.setItem('flexjobs_404_searches', JSON.stringify(searches));
        } catch (error) {
            console.warn('Could not store search data:', error);
        }
    }

    
    initHelpfulSuggestions() {
        const currentUrl = window.location.pathname;
        const suggestions = this.getSuggestionsFromUrl(currentUrl);
        
        if (suggestions.length > 0) {
            this.displayUrlSuggestions(suggestions);
        }
    }

    
    getSuggestionsFromUrl(url) {
        const suggestions = [];
        
        
        const patterns = {
            '/job': ['browse-jobs.html', 'Browse All Jobs'],
            '/jobs': ['browse-jobs.html', 'Browse All Jobs'],
            '/career': ['career-advice.html', 'Career Advice'],
            '/advice': ['career-advice.html', 'Career Advice'],
            '/blog': ['blog.html', 'Job Search Articles'],
            '/article': ['blog.html', 'Job Search Articles'],
            '/login': ['login.html', 'Sign In'],
            '/signin': ['login.html', 'Sign In'],
            '/register': ['registration.html', 'Create Account'],
            '/signup': ['registration.html', 'Create Account'],
            '/account': ['account.html', 'My Account'],
            '/profile': ['account.html', 'My Account'],
            '/about': ['about.html', 'About FlexJobs'],
            '/help': ['support.html', 'Get Help'],
            '/support': ['support.html', 'Get Help'],
            '/contact': ['support.html', 'Contact Support']
        };

        for (const [pattern, [suggestedUrl, title]] of Object.entries(patterns)) {
            if (url.toLowerCase().includes(pattern)) {
                suggestions.push({ url: suggestedUrl, title: title });
            }
        }

        return suggestions;
    }

    
    displayUrlSuggestions(suggestions) {
        if (suggestions.length === 0) return;

        const suggestion = suggestions[0]; 
        
        
        const banner = document.createElement('div');
        banner.className = 'error-404__url-suggestion';
        banner.innerHTML = `
            <div class="alert alert-info d-flex align-items-center" role="alert">
                <i class="fas fa-lightbulb me-2"></i>
                <div class="flex-grow-1">
                    Looking for <strong>${suggestion.title}</strong>?
                </div>
                <a href="${suggestion.url}" class="btn btn-sm btn-outline-primary ms-2">
                    Go There
                </a>
            </div>
        `;

        
        const title = document.querySelector('.error-404__title');
        if (title) {
            title.parentNode.insertBefore(banner, title.nextSibling);
        }
    }

    
    initBackgroundAnimation() {
        
        this.createFloatingElements();
    }

    
    createFloatingElements() {
        const container = document.querySelector('.error-404');
        if (!container) return;

        for (let i = 0; i < 10; i++) {
            const element = document.createElement('div');
            element.className = 'error-404__floating-element';
            element.style.cssText = `
                position: absolute;
                width: ${Math.random() * 100 + 50}px;
                height: ${Math.random() * 100 + 50}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
                pointer-events: none;
            `;
            
            container.appendChild(element);
        }
    }

    
    showMessage(message, type = 'info') {
        
        const existingMessages = document.querySelectorAll('.error-404__message-alert');
        existingMessages.forEach(msg => msg.remove());

        
        const messageDiv = document.createElement('div');
        messageDiv.className = `error-404__message-alert alert alert-${type} alert-dismissible fade show`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(messageDiv);

        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}


const additionalStyles = `
    .error-404__suggestions {
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        margin-top: 0.5rem;
        overflow: hidden;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .error-404__suggestion-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        color: #333;
        border-bottom: 1px solid #eee;
    }
    
    .error-404__suggestion-item:hover {
        background-color: #f8f9fa;
    }
    
    .error-404__suggestion-item:last-child {
        border-bottom: none;
    }
    
    .error-404__url-suggestion {
        margin: 2rem 0;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
        }
        33% {
            transform: translateY(-30px) rotate(120deg);
        }
        66% {
            transform: translateY(30px) rotate(240deg);
        }
    }
`;


const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);


document.addEventListener('DOMContentLoaded', () => {
    new Error404Page();
});


window.addEventListener('beforeunload', () => {
    
    const clickedLinks = document.querySelectorAll('a:hover');
    if (clickedLinks.length > 0) {
        console.log('User leaving 404 via:', clickedLinks[0].href);
    }
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = Error404Page;
}
