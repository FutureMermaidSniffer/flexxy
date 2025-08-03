



if (typeof window.UnifiedSearch === 'undefined') {

class UnifiedSearch {
    constructor() {
        this.searchInput = null;
        this.locationInput = null;
        this.searchButton = null;
        this.searchType = 'all'; 
        this.resultsContainer = null;
        this.isSearching = false;
        
        this.init();
    }

    init() {
        this.bindSearchElements();
        this.setupEventListeners();
        this.createSearchTypeToggle();
    }

    bindSearchElements() {
        
        this.searchInput = document.querySelector('.search-input');
        this.locationInput = document.querySelector('.location-input');
        this.searchButton = document.querySelector('.search-btn');
        
        if (!this.searchInput || !this.searchButton) {
            console.warn('Search elements not found');
            return;
        }
    }

    setupEventListeners() {
        if (!this.searchInput || !this.searchButton) return;

        
        this.searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });

        
        this.searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showSearchSuggestions(query);
            } else {
                this.hideSearchSuggestions();
            }
        }, 300));

        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-group')) {
                this.hideSearchSuggestions();
            }
        });
    }

    createSearchTypeToggle() {
        if (!this.searchInput) return;

        const searchContainer = this.searchInput.closest('.main-header__search-bar');
        if (!searchContainer) return;

        
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'search-type-toggle';
        toggleContainer.innerHTML = `
            <div class="btn-group btn-group-sm" role="group">
                <input type="radio" class="btn-check" name="searchType" id="searchAll" value="all" checked>
                <label class="btn btn-outline-header-blue" for="searchAll">All</label>
                
                <input type="radio" class="btn-check" name="searchType" id="searchJobs" value="jobs">
                <label class="btn btn-outline-header-blue" for="searchJobs">Jobs</label>
                
                <input type="radio" class="btn-check" name="searchType" id="searchAgents" value="agents">
                <label class="btn btn-outline-header-blue" for="searchAgents">Agents</label>
            </div>
        `;

        
        searchContainer.appendChild(toggleContainer);

        
        toggleContainer.querySelectorAll('input[name="searchType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.searchType = e.target.value;
                this.updateSearchPlaceholder();
            });
        });
    }

    updateSearchPlaceholder() {
        if (!this.searchInput) return;

        const placeholders = {
            all: 'Search jobs and agents...',
            jobs: 'Search for jobs...',
            agents: 'Search for agents...'
        };

        this.searchInput.placeholder = placeholders[this.searchType] || placeholders.all;
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        const location = this.locationInput ? this.locationInput.value.trim() : '';

        if (!query && !location) {
            this.showNotification('Please enter a search term or location', 'warning');
            return;
        }

        this.isSearching = true;
        this.showLoadingState();

        try {
            const results = await this.searchUnified(query, location);
            this.displayResults(results, query, location);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search failed. Please try again.', 'error');
        } finally {
            this.isSearching = false;
            this.hideLoadingState();
        }
    }

    async searchUnified(query, location) {
        const searchParams = new URLSearchParams();
        if (query) searchParams.append('q', query);
        if (location) searchParams.append('location', location);
        if (this.searchType !== 'all') searchParams.append('type', this.searchType);

        
        
        this.redirectToResults(searchParams);
        
        return null; 
    }

    redirectToResults(searchParams) {
        let redirectUrl;
        
        switch (this.searchType) {
            case 'jobs':
                redirectUrl = `job-search-results.html?${searchParams.toString()}`;
                break;
            case 'agents':
                redirectUrl = `agents.html?${searchParams.toString()}`;
                break;
            case 'all':
            default:
                redirectUrl = `search-results.html?${searchParams.toString()}`;
                break;
        }

        window.location.href = redirectUrl;
    }

    async showSearchSuggestions(query) {
        if (this.isSearching) return;

        try {
            
            if (!this.resultsContainer) {
                this.createSuggestionsContainer();
            }

            
            const suggestions = await this.fetchSuggestions(query);
            this.renderSuggestions(suggestions);
            this.showSuggestionsContainer();

        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    async fetchSuggestions(query) {
        const searchParams = new URLSearchParams({
            q: query,
            limit: 5
        });

        const promises = [];

        
        if (this.searchType === 'all' || this.searchType === 'jobs') {
            promises.push(
                fetch(`/api/jobs/search/suggestions?${searchParams.toString()}`)
                    .then(res => res.json())
                    .then(data => ({ type: 'jobs', items: data.suggestions || [] }))
                    .catch(() => ({ type: 'jobs', items: [] }))
            );
        }

        
        if (this.searchType === 'all' || this.searchType === 'agents') {
            promises.push(
                fetch(`/api/agents/search/suggestions?${searchParams.toString()}`)
                    .then(res => res.json())
                    .then(data => ({ type: 'agents', items: data.suggestions || [] }))
                    .catch(() => ({ type: 'agents', items: [] }))
            );
        }

        const results = await Promise.all(promises);
        return results;
    }

    createSuggestionsContainer() {
        const searchInputGroup = this.searchInput.closest('.search-input-group');
        if (!searchInputGroup) return;

        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'search-suggestions';
        this.resultsContainer.style.display = 'none';

        searchInputGroup.appendChild(this.resultsContainer);
    }

    renderSuggestions(suggestions) {
        if (!this.resultsContainer || !suggestions || suggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        let html = '<div class="suggestions-content">';

        suggestions.forEach(group => {
            if (group.items && group.items.length > 0) {
                html += `<div class="suggestion-group">`;
                html += `<div class="suggestion-group-title">${group.type === 'jobs' ? 'Jobs' : 'Agents'}</div>`;
                
                group.items.forEach(item => {
                    if (group.type === 'jobs') {
                        html += `
                            <div class="suggestion-item" data-type="job" data-id="${item.id}">
                                <i class="fas fa-briefcase suggestion-icon"></i>
                                <div class="suggestion-content">
                                    <div class="suggestion-title">${item.title}</div>
                                    <div class="suggestion-meta">${item.company_name} • ${item.location}</div>
                                </div>
                            </div>`;
                    } else {
                        
                        const rating = item.rating || 0;
                        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                        const specialties = item.specializations ? 
                            (Array.isArray(item.specializations) ? item.specializations.slice(0, 2).join(', ') : item.specializations.split(',').slice(0, 2).join(', '))
                            : '';
                        
                        html += `
                            <div class="suggestion-item agent-suggestion" data-type="agent" data-id="${item.id}">
                                <div class="suggestion-icon-wrapper">
                                    <i class="fas fa-user-tie suggestion-icon"></i>
                                </div>
                                <div class="suggestion-content">
                                    <div class="suggestion-title">${item.agent_name || item.display_name}</div>
                                    <div class="suggestion-meta">
                                        <span class="agent-rating">${stars} ${rating.toFixed(1)}</span>
                                        ${item.location ? ` • ${item.location}` : ''}
                                    </div>
                                    ${specialties ? `<div class="suggestion-specialties">${specialties}</div>` : ''}
                                </div>
                            </div>`;
                    }
                });
                
                html += '</div>';
            }
        });

        html += '</div>';
        this.resultsContainer.innerHTML = html;

        
        this.resultsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const id = e.currentTarget.dataset.id;
                this.selectSuggestion(type, id);
            });
        });
    }

    selectSuggestion(type, id) {
        if (type === 'job') {
            window.location.href = `job-preview.html?id=${id}`;
        } else if (type === 'agent') {
            
            window.location.href = `agents.html?agent=${id}`;
        }
        
        
        this.hideSearchSuggestions();
    }

    showSuggestionsContainer() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'block';
        }
    }

    hideSearchSuggestions() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
    }

    showLoadingState() {
        if (this.searchButton) {
            this.searchButton.disabled = true;
            this.searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    hideLoadingState() {
        if (this.searchButton) {
            this.searchButton.disabled = false;
            this.searchButton.innerHTML = '<i class="fas fa-search"></i>';
        }
    }

    showNotification(message, type) {
        
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}


const searchStyles = `
    .search-type-toggle {
        margin-bottom: 0.5rem;
    }

    .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
    }

    .suggestion-group {
        border-bottom: 1px solid #f0f0f0;
    }

    .suggestion-group:last-child {
        border-bottom: none;
    }

    .suggestion-group-title {
        padding: 0.75rem 1rem 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        color: #6B7280;
        background: #f9f9f9;
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .suggestion-item:hover {
        background-color: #f8f9fa;
    }

    .suggestion-icon {
        color: #6B7280;
        margin-right: 0.75rem;
        width: 16px;
    }

    .suggestion-title {
        font-weight: 500;
        color: #1f2937;
    }

    .suggestion-meta {
        font-size: 0.875rem;
        color: #6B7280;
    }

    .search-input-group {
        position: relative;
    }
`;


document.addEventListener('DOMContentLoaded', () => {
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);

    
    const unifiedSearch = new UnifiedSearch();
    
    
    window.UnifiedSearch = unifiedSearch;
});


window.UnifiedSearch = UnifiedSearch;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedSearch;
}

} 
