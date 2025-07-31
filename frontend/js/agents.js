// Agents Page JavaScript
class AgentsManager {
    constructor() {
        this.agents = [];
        this.filteredAgents = [];
        this.currentPage = 1;
        this.pageSize = 12;
        this.filters = {
            search: '',
            location: '',
            specialty: '',
            rating: '',
            verification: '',
            sortBy: 'rating'
        };
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.init();
    }

    async init() {
        try {
            // Load components
            await this.loadComponents();
            
            // Parse URL parameters
            this.parseUrlParams();
            
            // Load agents
            await this.loadAgents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render
            this.applyFilters();
            
        } catch (error) {
            console.error('Error initializing agents page:', error);
            this.showError('Error loading agents information');
        }
    }

    async loadComponents() {
        try {
            // Load main header with agent search placeholder
            const headerResponse = await fetch('components/main-header/main-header.html');
            const headerHtml = await headerResponse.text();
            document.getElementById('main-header-container').innerHTML = headerHtml;
            
            // Load footer
            const footerResponse = await fetch('components/main-footer/main-footer.html');
            const footerHtml = await footerResponse.text();
            document.getElementById('footer-container').innerHTML = footerHtml;
            
            // Initialize main header with agent search configuration
            if (typeof MainHeader !== 'undefined') {
                window.mainHeader = new MainHeader({
                    searchPlaceholder: 'Search for agents...',
                    onSearch: (data) => this.handleHeaderSearch(data)
                });
            }
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.filters.search = urlParams.get('q') || '';
        this.filters.location = urlParams.get('location') || '';
        
        // Set search input values if they exist
        setTimeout(() => {
            if (window.mainHeader && window.mainHeader.searchInput && this.filters.search) {
                window.mainHeader.searchInput.value = this.filters.search;
            }
            if (window.mainHeader && window.mainHeader.locationInput && this.filters.location) {
                window.mainHeader.locationInput.value = this.filters.location;
            }
        }, 100);
    }

    handleHeaderSearch(data) {
        this.filters.search = data.searchTerm;
        this.filters.location = data.location;
        this.currentPage = 1;
        this.applyFilters();
        
        // Update URL
        this.updateUrl();
    }

    async loadAgents() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/agents');
            const data = await response.json();
            
            if (response.ok) {
                this.agents = data.data;
            } else {
                throw new Error(data.message || 'Failed to load agents');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            this.showError('Error loading agents');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Filter controls
        const specialtyFilter = document.getElementById('specialtyFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        const verificationFilter = document.getElementById('verificationFilter');
        const sortBy = document.getElementById('sortBy');

        [specialtyFilter, ratingFilter, verificationFilter, sortBy].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.updateFiltersFromUI();
                    this.currentPage = 1;
                    this.applyFilters();
                    this.updateUrl();
                });
            }
        });

        // View toggle
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');

        if (gridView) {
            gridView.addEventListener('change', () => {
                if (gridView.checked) {
                    this.viewMode = 'grid';
                    this.renderAgents();
                }
            });
        }

        if (listView) {
            listView.addEventListener('change', () => {
                if (listView.checked) {
                    this.viewMode = 'list';
                    this.renderAgents();
                }
            });
        }
    }

    updateFiltersFromUI() {
        this.filters.specialty = document.getElementById('specialtyFilter')?.value || '';
        this.filters.rating = document.getElementById('ratingFilter')?.value || '';
        this.filters.verification = document.getElementById('verificationFilter')?.value || '';
        this.filters.sortBy = document.getElementById('sortBy')?.value || 'rating';
    }

    applyFilters() {
        let filtered = [...this.agents];

        // Search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(agent => 
                agent.name.toLowerCase().includes(searchTerm) ||
                agent.specialties.some(specialty => 
                    specialty.toLowerCase().includes(searchTerm)
                ) ||
                agent.bio.toLowerCase().includes(searchTerm)
            );
        }

        // Location filter
        if (this.filters.location) {
            const locationTerm = this.filters.location.toLowerCase();
            filtered = filtered.filter(agent => 
                agent.location.toLowerCase().includes(locationTerm)
            );
        }

        // Specialty filter
        if (this.filters.specialty) {
            filtered = filtered.filter(agent => 
                agent.specialties.includes(this.filters.specialty)
            );
        }

        // Rating filter
        if (this.filters.rating) {
            const minRating = parseFloat(this.filters.rating);
            filtered = filtered.filter(agent => 
                agent.average_rating >= minRating
            );
        }

        // Verification filter
        if (this.filters.verification) {
            if (this.filters.verification === 'verified') {
                filtered = filtered.filter(agent => agent.is_verified);
            } else if (this.filters.verification === 'featured') {
                filtered = filtered.filter(agent => agent.is_featured);
            }
        }

        // Sort
        this.sortAgents(filtered);

        this.filteredAgents = filtered;
        this.renderResults();
    }

    sortAgents(agents) {
        switch (this.filters.sortBy) {
            case 'rating':
                agents.sort((a, b) => b.average_rating - a.average_rating);
                break;
            case 'experience':
                agents.sort((a, b) => b.years_experience - a.years_experience);
                break;
            case 'reviews':
                agents.sort((a, b) => b.total_reviews - a.total_reviews);
                break;
            case 'alphabetical':
                agents.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }

    renderResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageAgents = this.filteredAgents.slice(startIndex, endIndex);

        // Update results count
        this.updateResultsCount();

        // Show/hide sections
        const resultsHeader = document.getElementById('resultsHeader');
        const agentsGrid = document.getElementById('agentsGrid');
        const noResults = document.getElementById('noResults');
        const pagination = document.getElementById('pagination');

        if (this.filteredAgents.length === 0) {
            resultsHeader.style.display = 'none';
            agentsGrid.style.display = 'none';
            noResults.style.display = 'block';
            pagination.style.display = 'none';
        } else {
            resultsHeader.style.display = 'block';
            agentsGrid.style.display = 'block';
            noResults.style.display = 'none';
            pagination.style.display = 'block';
        }

        // Render agents
        this.renderAgents(pageAgents);
        
        // Render pagination
        this.renderPagination();
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = this.filteredAgents.length;
            const start = (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, total);
            
            if (total === 0) {
                resultsCount.textContent = 'No agents found';
            } else if (total <= this.pageSize) {
                resultsCount.textContent = `Showing ${total} agent${total === 1 ? '' : 's'}`;
            } else {
                resultsCount.textContent = `Showing ${start}-${end} of ${total} agents`;
            }
        }
    }

    renderAgents(agents = null) {
        const agentsToRender = agents || this.filteredAgents.slice(
            (this.currentPage - 1) * this.pageSize,
            this.currentPage * this.pageSize
        );
        
        const container = document.getElementById('agentsGrid');
        if (!container) return;

        container.innerHTML = '';
        container.className = this.viewMode === 'grid' ? 'row' : '';

        agentsToRender.forEach(agent => {
            const agentElement = this.createAgentCard(agent);
            container.appendChild(agentElement);
        });
    }

    createAgentCard(agent) {
        const isGridView = this.viewMode === 'grid';
        const element = document.createElement('div');
        
        if (isGridView) {
            element.className = 'col-lg-4 col-md-6 mb-4';
            element.innerHTML = this.createGridCard(agent);
        } else {
            element.className = 'col-12';
            element.innerHTML = this.createListCard(agent);
        }

        return element;
    }

    createGridCard(agent) {
        const badges = this.createBadges(agent);
        const specialties = this.createSpecialtyTags(agent.specialties);
        const rating = this.createRatingStars(agent.average_rating);

        return `
            <div class="card agent-card h-100" onclick="agentsManager.showAgentModal(${agent.id})">
                <div class="position-relative">
                    ${badges}
                    <div class="card-body text-center">
                        <img src="${agent.profile_image || 'images/f.png'}" 
                             alt="${agent.name}" class="agent-avatar mb-3" onerror="this.src='images/f.png'">
                        <h5 class="card-title mb-2">${agent.name}</h5>
                        <div class="agent-rating mb-2">
                            ${rating}
                            <span class="text-muted ms-1">(${agent.total_reviews})</span>
                        </div>
                        <p class="text-muted small mb-3">${agent.location}</p>
                        <p class="card-text small mb-3">${this.truncateText(agent.bio, 100)}</p>
                        <div class="specialties mb-3">
                            ${specialties}
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary fw-bold">$${agent.hourly_rate}/hr</span>
                            <small class="text-muted">${agent.years_experience} years exp.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createListCard(agent) {
        const badges = this.createBadges(agent);
        const specialties = this.createSpecialtyTags(agent.specialties);
        const rating = this.createRatingStars(agent.average_rating);

        return `
            <div class="card agent-card agent-card-list" onclick="agentsManager.showAgentModal(${agent.id})">
                <div class="position-relative">
                    ${badges}
                    <img src="${agent.profile_image || 'images/f.png'}" 
                         alt="${agent.name}" class="agent-avatar" onerror="this.src='images/f.png'">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="mb-0">${agent.name}</h5>
                            <span class="text-primary fw-bold">$${agent.hourly_rate}/hr</span>
                        </div>
                        <div class="agent-rating mb-2">
                            ${rating}
                            <span class="text-muted ms-1">(${agent.total_reviews})</span>
                            <span class="text-muted ms-3">${agent.location}</span>
                            <span class="text-muted ms-3">${agent.years_experience} years experience</span>
                        </div>
                        <p class="text-muted mb-2">${this.truncateText(agent.bio, 200)}</p>
                        <div class="specialties">
                            ${specialties}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createBadges(agent) {
        let badges = '';
        if (agent.is_featured) {
            badges += '<span class="verification-badge featured-badge">Featured</span>';
        } else if (agent.is_verified) {
            badges += '<span class="verification-badge">Verified</span>';
        }
        return badges;
    }

    createSpecialtyTags(specialties) {
        return specialties.slice(0, 3).map(specialty => 
            `<span class="specialty-tag">${specialty}</span>`
        ).join('');
    }

    createRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return `<span class="agent-rating">${stars} ${rating.toFixed(1)}</span>`;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredAgents.length / this.pageSize);
        const pagination = document.getElementById('paginationList');
        
        if (!pagination || totalPages <= 1) {
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        document.getElementById('pagination').style.display = 'block';
        pagination.innerHTML = '';

        // Previous button
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevItem.innerHTML = `<a class="page-link" href="#" onclick="agentsManager.goToPage(${this.currentPage - 1})">Previous</a>`;
        pagination.appendChild(prevItem);

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            const firstItem = document.createElement('li');
            firstItem.className = 'page-item';
            firstItem.innerHTML = '<a class="page-link" href="#" onclick="agentsManager.goToPage(1)">1</a>';
            pagination.appendChild(firstItem);

            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#" onclick="agentsManager.goToPage(${i})">${i}</a>`;
            pagination.appendChild(pageItem);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }

            const lastItem = document.createElement('li');
            lastItem.className = 'page-item';
            lastItem.innerHTML = `<a class="page-link" href="#" onclick="agentsManager.goToPage(${totalPages})">${totalPages}</a>`;
            pagination.appendChild(lastItem);
        }

        // Next button
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextItem.innerHTML = `<a class="page-link" href="#" onclick="agentsManager.goToPage(${this.currentPage + 1})">Next</a>`;
        pagination.appendChild(nextItem);
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredAgents.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderResults();
            this.updateUrl();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    async showAgentModal(agentId) {
        try {
            const agent = this.agents.find(a => a.id === agentId);
            if (!agent) return;

            const modal = new bootstrap.Modal(document.getElementById('agentModal'));
            const modalBody = document.getElementById('agentModalBody');
            const bookBtn = document.getElementById('bookConsultationBtn');

            modalBody.innerHTML = this.createAgentModalContent(agent);
            
            // Configure book consultation button
            bookBtn.onclick = () => this.bookConsultation(agentId);
            
            modal.show();

        } catch (error) {
            console.error('Error showing agent modal:', error);
            this.showAlert('Error loading agent details', 'danger');
        }
    }

    createAgentModalContent(agent) {
        const rating = this.createRatingStars(agent.average_rating);
        const specialties = agent.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('');
        const badges = this.createBadges(agent);

        return `
            <div class="row">
                <div class="col-md-4 text-center">
                    <div class="position-relative d-inline-block">
                        <img src="${agent.profile_image || 'images/f.png'}" 
                             alt="${agent.name}" class="agent-avatar mb-3" style="width: 120px; height: 120px;" onerror="this.src='images/f.png'">
                        ${badges}
                    </div>
                    <h4>${agent.name}</h4>
                    <div class="agent-rating mb-2">
                        ${rating}
                        <div class="text-muted">(${agent.total_reviews} reviews)</div>
                    </div>
                    <p class="text-muted">${agent.location}</p>
                    <div class="mb-3">
                        <strong class="text-primary">$${agent.hourly_rate}/hour</strong>
                    </div>
                </div>
                <div class="col-md-8">
                    <h5>About</h5>
                    <p>${agent.bio}</p>
                    
                    <h5>Experience</h5>
                    <p>${agent.years_experience} years of professional experience</p>
                    
                    <h5>Specialties</h5>
                    <div class="mb-3">${specialties}</div>
                    
                    ${agent.certifications ? `
                        <h5>Certifications</h5>
                        <ul>
                            ${agent.certifications.map(cert => `<li>${cert}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    <h5>Languages</h5>
                    <p>${agent.languages ? agent.languages.join(', ') : 'English'}</p>
                </div>
            </div>
        `;
    }

    bookConsultation(agentId) {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            this.showAlert('Please log in to book a consultation', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html#login';
            }, 2000);
            return;
        }

        // Redirect to booking page (to be implemented)
        window.location.href = `book-consultation.html?agent=${agentId}`;
    }

    updateUrl() {
        const params = new URLSearchParams();
        if (this.filters.search) params.set('q', this.filters.search);
        if (this.filters.location) params.set('location', this.filters.location);
        if (this.currentPage > 1) params.set('page', this.currentPage.toString());

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        this.showLoading(false);
        this.showAlert(message, 'danger');
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Global functions
function clearFilters() {
    // Reset all filters
    document.getElementById('specialtyFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('verificationFilter').value = '';
    document.getElementById('sortBy').value = 'rating';
    
    // Clear search inputs
    if (window.mainHeader && window.mainHeader.searchInput) {
        window.mainHeader.searchInput.value = '';
    }
    if (window.mainHeader && window.mainHeader.locationInput) {
        window.mainHeader.locationInput.value = '';
    }
    
    // Reset manager filters
    agentsManager.filters = {
        search: '',
        location: '',
        specialty: '',
        rating: '',
        verification: '',
        sortBy: 'rating'
    };
    agentsManager.currentPage = 1;
    agentsManager.applyFilters();
    agentsManager.updateUrl();
}

// Initialize agents manager when page loads
let agentsManager;
document.addEventListener('DOMContentLoaded', () => {
    agentsManager = new AgentsManager();
});
