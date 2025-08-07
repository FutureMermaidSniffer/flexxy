


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

    
    async init() {
        // console.log('🚀 Initializing Browse Jobs Manager'); // Debug mode only
        
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        
        this.container = document.querySelector('#jobs-container');
        this.loadingElement = document.querySelector('#jobs-loading');
        this.paginationContainer = document.querySelector('#pagination-container');
        
        if (!this.container) {
            console.error('❌ Job listings container (#jobs-container) not found');
            return;
        }

        if (!this.loadingElement) {
            console.error('❌ Loading element (#jobs-loading) not found');
            return;
        }

        console.log('✅ Job listings elements found');

        
        this.createErrorElement();

        // Parse URL parameters for initial filters
        this.parseUrlParameters();

        
        await this.loadJobs();
    }

    
    parseUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Map URL parameters to filter properties
        const paramMap = {
            'search': 'search',
            'q': 'search',
            'location': 'location',
            'job_type': 'job_type',
            'remote_type': 'remote_type',
            'experience_level': 'experience_level',
            'category': 'category_id'
        };

        // Apply URL parameters to filters
        Object.entries(paramMap).forEach(([urlParam, filterKey]) => {
            const value = urlParams.get(urlParam);
            if (value) {
                this.filters[filterKey] = value;
                console.log(`🔍 Applied URL filter: ${filterKey} = ${value}`);
            }
        });
    }

    
    createErrorElement() {
        
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

    
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        if (this.container) {
            this.container.style.display = 'none';
        }
        console.log('🔄 Showing loading state');
    }

    
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        if (this.container) {
            this.container.style.display = 'flex';
        }
        console.log('✅ Hiding loading state');
    }

    
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
        
        
        const retryBtn = this.errorElement.querySelector('#retry-jobs-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadJobs());
        }
    }

    
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

    
    buildApiUrl() {
        const params = new URLSearchParams();
        
        
        params.append('page', this.currentPage);
        params.append('limit', this.jobsPerPage);
        params.append('is_active', 'true');

        
        Object.entries(this.filters).forEach(([key, value]) => {
            if (value && value.trim()) {
                params.append(key, value.trim());
            }
        });

        return `/api/jobs?${params.toString()}`;
    }

    
    async loadJobs() {
        console.log('📋 Loading jobs for browse page', {
            page: this.currentPage,
            filters: this.filters
        });
        
        this.showLoading();

        try {
            // Check if jobs database is available
            if (typeof window.JobsDatabase === 'undefined') {
                throw new Error('Jobs database not loaded');
            }

            // Apply search and filters to the database
            let filteredJobs = window.JOBS_DATABASE;

            // Apply search filter
            if (this.filters.search) {
                filteredJobs = window.JobsDatabase.searchJobs(this.filters.search, {
                    category: this.filters.category_id,
                    remote_type: this.filters.remote_type,
                    experience_level: this.filters.experience_level,
                    location: this.filters.location
                });
            } else {
                // Apply individual filters
                if (this.filters.category_id) {
                    filteredJobs = filteredJobs.filter(job => job.category === this.filters.category_id);
                }
                if (this.filters.remote_type) {
                    filteredJobs = filteredJobs.filter(job => job.remote_type === this.filters.remote_type);
                }
                if (this.filters.experience_level) {
                    filteredJobs = filteredJobs.filter(job => job.experience_level === this.filters.experience_level);
                }
                if (this.filters.location) {
                    filteredJobs = filteredJobs.filter(job => 
                        job.location.toLowerCase().includes(this.filters.location.toLowerCase())
                    );
                }
                if (this.filters.job_type) {
                    filteredJobs = filteredJobs.filter(job => job.job_type === this.filters.job_type);
                }
            }

            // Calculate pagination
            this.totalJobs = filteredJobs.length;
            this.totalPages = Math.ceil(this.totalJobs / this.jobsPerPage);
            
            // Get jobs for current page
            const startIndex = (this.currentPage - 1) * this.jobsPerPage;
            const endIndex = startIndex + this.jobsPerPage;
            const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

            console.log('✅ Jobs data processed:', {
                total: this.totalJobs,
                currentPage: this.currentPage,
                showing: paginatedJobs.length
            });

            if (paginatedJobs.length === 0) {
                this.showEmptyState();
                this.updateJobStats(0, 0, 0);
                this.updatePagination({
                    page: this.currentPage,
                    totalPages: this.totalPages,
                    hasNext: false,
                    hasPrev: false
                });
                return;
            }

            // Create pagination object
            const pagination = {
                page: this.currentPage,
                totalPages: this.totalPages,
                total: this.totalJobs,
                hasNext: this.currentPage < this.totalPages,
                hasPrev: this.currentPage > 1
            };

            // Render jobs
            this.renderJobs(paginatedJobs);
            
            // Update UI
            this.updateJobStats(paginatedJobs.length, this.totalJobs, this.currentPage);
            this.updatePagination(pagination);
            
            // Hide loading
            this.hideLoading();

            console.log(`🎯 Successfully loaded ${paginatedJobs.length} jobs (page ${this.currentPage})`);

        } catch (error) {
            console.error('❌ Error loading jobs:', error);
            this.showError(error.message);
        }
    }

    
    renderJobs(jobs) {
        
        this.container.innerHTML = '';

        
        jobs.forEach((job, index) => {
            const jobCardHtml = this.jobCard.render(job);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-lg-6 col-md-6 mb-4';
            cardWrapper.innerHTML = jobCardHtml;
            
            
            const card = cardWrapper.querySelector('.job-card, .card');
            if (card) {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in-up');
            }
            
            this.container.appendChild(cardWrapper);
        });

        
        this.jobCard.setupEventListeners(this.container);
    }

    
    updateJobStats(currentCount, totalCount, currentPage) {
        
        const resultsElement = document.querySelector('.results-count, .job-count');
        if (resultsElement) {
            const startIndex = ((currentPage - 1) * this.jobsPerPage) + 1;
            const endIndex = Math.min(startIndex + currentCount - 1, totalCount);
            
            resultsElement.textContent = `Showing ${startIndex}-${endIndex} of ${totalCount} jobs`;
        }

        
        const headerCount = document.querySelector('.jobs-header .job-count');
        if (headerCount) {
            headerCount.textContent = `${totalCount} Jobs Found`;
        }
    }

    
    updatePagination(pagination) {
        if (!this.paginationContainer || !pagination) return;

        const { page = 1, totalPages = 1, hasNext = false, hasPrev = false } = pagination;

        let paginationHtml = '<nav aria-label="Job listings pagination"><ul class="pagination justify-content-center">';

        
        paginationHtml += `
            <li class="page-item ${!hasPrev ? 'disabled' : ''}">
                <button class="page-link pagination-btn" data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            </li>
        `;

        
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

        
        paginationHtml += `
            <li class="page-item ${!hasNext ? 'disabled' : ''}">
                <button class="page-link pagination-btn" data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;

        paginationHtml += '</ul></nav>';

        this.paginationContainer.innerHTML = paginationHtml;
        
        
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

    
    async goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        await this.loadJobs();
        
        
        if (this.container) {
            this.container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    
    async applyFilters(newFilters = {}) {
        this.filters = { ...this.filters, ...newFilters };
        this.currentPage = 1; 
        await this.loadJobs();
    }

    
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

    
    async refresh() {
        await this.loadJobs();
    }
}


let browseJobsManager;


document.addEventListener('DOMContentLoaded', async () => {
    
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        
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


window.browseJobsManager = browseJobsManager;
