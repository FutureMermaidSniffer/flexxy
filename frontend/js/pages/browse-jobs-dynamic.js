// Browse Jobs Page - Dynamic Job Listings Management
// Fetches and displays jobs with pagination and filtering for browse-jobs.html

class BrowseJobsManager {
    constructor() {
        this.jobCard = new JobCard({
            displayMode: 'list',
            showSaveButton: true,
            showApplyButton: true,
            showViewsCount: true,
            truncateDescription: true
        });
        this.container = null;
        this.loadingElement = null;
        this.errorElement = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalJobs = 0;
        this.jobsPerPage = 12;
        this.filters = {
            search: '',
            location: '',
            job_type: '',
            remote_type: '',
            experience_level: '',
            category_id: ''
        };
    }

    // Initialize the browse jobs system
    async init() {
        console.log('🚀 Initializing Browse Jobs Manager');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Find the job listings container
        this.container = document.querySelector('#jobs-container');
        this.loadingElement = document.querySelector('#jobs-loading');
        
        if (!this.container) {
            console.error('❌ Job listings container (#jobs-container) not found');
            return;
        }

        console.log('✅ Job listings container found:', this.container);

        // Create status elements
        this.createStatusElements();

        // Find pagination container
        this.paginationContainer = document.querySelector('#pagination-container');

        // Load initial jobs
        await this.loadJobs();
    }

    // Create loading and error status elements
    createStatusElements() {
        // Loading spinner
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'col-12 text-center py-5';
        this.loadingElement.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading jobs...</span>
            </div>
            <p class="mt-3 text-muted">Finding amazing job opportunities...</p>
        `;

        // Error state
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'col-12 text-center py-5';
        this.errorElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Oops!</strong> We couldn't load jobs right now.
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-jobs-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            </div>
        `;
    }

    // Initialize pagination controls
    initializePaginationControls() {
        // Create pagination container if it doesn't exist
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container text-center mt-5';
            
            // Insert after the job listings container
            if (this.container.parentNode) {
                this.container.parentNode.insertBefore(paginationContainer, this.container.nextSibling);
            }
        }

        this.paginationContainer = paginationContainer;
    }

    // Show loading state
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        this.container.style.display = 'none';
    }

    // Hide loading state
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        this.container.style.display = 'flex';
    }

    // Show error state
    showError(message = null) {
        this.hideLoading();
        if (message) {
            this.errorElement.querySelector('.alert').innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-jobs-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            `;
        }
        this.container.innerHTML = '';
        this.container.appendChild(this.errorElement);
        this.container.style.display = 'flex';
        
        // Add event listener for retry button
        const retryBtn = this.errorElement.querySelector('#retry-jobs-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadJobs());
        }
    }

    // Show empty state
    showEmptyState() {
        this.hideLoading();
        this.container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-briefcase me-2"></i>
                    <strong>No jobs found</strong><br>
                    Try adjusting your search criteria or check back later for new opportunities!
                </div>
            </div>
        `;
        this.container.style.display = 'flex';
    }

    // Build API URL with filters and pagination
    buildApiUrl() {
        const params = new URLSearchParams();
        
        // Pagination
        params.append('page', this.currentPage);
        params.append('limit', this.jobsPerPage);
        params.append('is_active', 'true');

        // Filters
        Object.entries(this.filters).forEach(([key, value]) => {
            if (value && value.trim()) {
                params.append(key, value.trim());
            }
        });

        return `/api/jobs?${params.toString()}`;
    }

    // Load and display jobs
    async loadJobs() {
        console.log('📋 Loading jobs for browse page', {
            page: this.currentPage,
            filters: this.filters
        });
        
        this.showLoading();

        try {
            const apiUrl = this.buildApiUrl();
            console.log('🔗 API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Jobs data received:', data);

            if (!data.jobs || data.jobs.length === 0) {
                this.showEmptyState();
                this.updateJobStats(0, 0, 0);
                this.updatePagination(data.pagination || {});
                return;
            }

            // Update pagination info
            if (data.pagination) {
                this.totalPages = data.pagination.totalPages;
                this.totalJobs = parseInt(data.pagination.total);
            }

            // Render job cards
            this.renderJobs(data.jobs);
            
            // Update statistics and pagination
            this.updateJobStats(data.jobs.length, this.totalJobs, this.currentPage);
            this.updatePagination(data.pagination);
            
            // Hide loading and show results
            this.hideLoading();

            console.log(`🎯 Successfully loaded ${data.jobs.length} jobs (page ${this.currentPage})`);

        } catch (error) {
            console.error('❌ Error loading jobs:', error);
            this.showError(error.message);
        }
    }

    // Render jobs using the job card component
    renderJobs(jobs) {
        // Clear container
        this.container.innerHTML = '';

        // Create job cards
        jobs.forEach((job, index) => {
            const jobCardHtml = this.jobCard.render(job);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-lg-6 col-md-6 mb-4';
            cardWrapper.innerHTML = jobCardHtml;
            
            // Add staggered animation
            const card = cardWrapper.querySelector('.job-card, .card');
            if (card) {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in-up');
            }
            
            this.container.appendChild(cardWrapper);
        });

        // Set up event listeners for job card interactions
        this.jobCard.setupEventListeners(this.container);
    }

    // Update job statistics display
    updateJobStats(currentCount, totalCount, currentPage) {
        // Update results counter
        const resultsElement = document.querySelector('.results-count, .job-count');
        if (resultsElement) {
            const startIndex = ((currentPage - 1) * this.jobsPerPage) + 1;
            const endIndex = Math.min(startIndex + currentCount - 1, totalCount);
            
            resultsElement.textContent = `Showing ${startIndex}-${endIndex} of ${totalCount} jobs`;
        }

        // Update any other count displays
        const headerCount = document.querySelector('.jobs-header .job-count');
        if (headerCount) {
            headerCount.textContent = `${totalCount} Jobs Found`;
        }
    }

    // Update pagination controls
    updatePagination(pagination) {
        if (!this.paginationContainer || !pagination) return;

        const { page = 1, totalPages = 1, hasNext = false, hasPrev = false } = pagination;

        let paginationHtml = '<nav aria-label="Job listings pagination"><ul class="pagination justify-content-center">';

        // Previous button
        paginationHtml += `
            <li class="page-item ${!hasPrev ? 'disabled' : ''}">
                <button class="page-link pagination-btn" data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);

        if (startPage > 1) {
            paginationHtml += `<li class="page-item"><button class="page-link pagination-btn" data-page="1">1</button></li>`;
            if (startPage > 2) paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link pagination-btn" data-page="${i}">${i}</button>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            paginationHtml += `<li class="page-item"><button class="page-link pagination-btn" data-page="${totalPages}">${totalPages}</button></li>`;
        }

        // Next button
        paginationHtml += `
            <li class="page-item ${!hasNext ? 'disabled' : ''}">
                <button class="page-link pagination-btn" data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;

        paginationHtml += '</ul></nav>';

        this.paginationContainer.innerHTML = paginationHtml;
        
        // Add event listeners to pagination buttons
        const paginationButtons = this.paginationContainer.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && !isNaN(page)) {
                    this.goToPage(page);
                }
            });
        });
    }

    // Navigate to specific page
    async goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        await this.loadJobs();
        
        // Scroll to top of job listings
        if (this.container) {
            this.container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Apply filters and reload jobs
    async applyFilters(newFilters = {}) {
        this.filters = { ...this.filters, ...newFilters };
        this.currentPage = 1; // Reset to first page
        await this.loadJobs();
    }

    // Clear all filters
    async clearFilters() {
        this.filters = {
            search: '',
            location: '',
            job_type: '',
            remote_type: '',
            experience_level: '',
            category_id: ''
        };
        this.currentPage = 1;
        await this.loadJobs();
    }

    // Refresh current page
    async refresh() {
        await this.loadJobs();
    }
}

// Global instance
let browseJobsManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for JobCard component to be available
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        // Load job card component if not already loaded
        const script = document.createElement('script');
        script.src = 'js/components/job-card.js';
        script.onload = async () => {
            browseJobsManager = new BrowseJobsManager();
            await browseJobsManager.init();
        };
        document.head.appendChild(script);
    } else {
        browseJobsManager = new BrowseJobsManager();
        await browseJobsManager.init();
    }
});

// Export for global access
window.browseJobsManager = browseJobsManager;
