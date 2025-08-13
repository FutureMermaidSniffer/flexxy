/**
 * Job Search Results Page
 * Handles job search functionality and integrates with jobs-database.js
 */

class JobSearchResultsPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.allJobs = [];
        this.filteredJobs = [];
        this.currentFilters = {
            search: '',
            location: '',
            jobType: [],
            experienceLevel: [],
            salaryRange: [],
            sortBy: 'relevance'
        };
        
        this.init();
    }

    async init() {
        try {
            // Wait for the DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
            } else {
                this.initialize();
            }
        } catch (error) {
            console.error('Error initializing JobSearchResultsPage:', error);
        }
    }

    initialize() {
        // Parse URL parameters
        this.parseUrlParams();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load jobs
        this.loadJobs();
        
        // Setup main header integration
        this.setupHeaderIntegration();
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Get search parameters
        this.currentFilters.search = urlParams.get('q') || '';
        this.currentFilters.location = urlParams.get('location') || '';
        
        // Update results count display
        this.updateResultsCount();
    }

    setupEventListeners() {
        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.sortAndDisplayJobs();
            });
        }

        // Filter checkboxes
        this.setupFilterListeners();
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreJobs();
            });
        }
    }

    setupFilterListeners() {
        // Job type filters
        const jobTypeCheckboxes = document.querySelectorAll('input[value="full-time"], input[value="part-time"], input[value="contract"], input[value="freelance"]');
        jobTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
                this.applyFilters();
            });
        });

        // Experience level filters
        const experienceCheckboxes = document.querySelectorAll('input[value="entry"], input[value="mid"], input[value="senior"], input[value="executive"]');
        experienceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
                this.applyFilters();
            });
        });

        // Salary range filters
        const salaryCheckboxes = document.querySelectorAll('input[value="30k-50k"], input[value="50k-75k"], input[value="75k-100k"], input[value="100k+"]');
        salaryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
                this.applyFilters();
            });
        });
    }

    setupHeaderIntegration() {
        // Listen for search events from the main header
        document.addEventListener('headerSearch', (event) => {
            const { searchTerm, location, searchType } = event.detail;
            
            if (searchType === 'jobs' || searchType === 'all') {
                this.currentFilters.search = searchTerm;
                this.currentFilters.location = location;
                this.currentPage = 1;
                this.applyFilters();
                this.updateUrl();
            }
        });
    }

    async loadJobs() {
        try {
            this.showLoading(true);
            
            // Check if JobsDatabase is available
            if (typeof JobsDatabase === 'undefined') {
                throw new Error('JobsDatabase not loaded');
            }

            // Get all jobs from the database
            this.allJobs = JobsDatabase.getAllJobs();
            
            // Apply initial filters
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.showError('Error loading jobs. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    applyFilters() {
        let filtered = [...this.allJobs];

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(job => {
                return (
                    job.title.toLowerCase().includes(searchTerm) ||
                    job.company.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm) ||
                    (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
                );
            });
        }

        // Apply location filter (for jobs, location is respected)
        if (this.currentFilters.location) {
            const locationTerm = this.currentFilters.location.toLowerCase();
            filtered = filtered.filter(job => {
                return job.location.toLowerCase().includes(locationTerm) ||
                       job.remote_type === 'fully_remote' ||
                       job.remote_type === 'hybrid';
            });
        }

        // Apply job type filters
        if (this.currentFilters.jobType.length > 0) {
            filtered = filtered.filter(job => 
                this.currentFilters.jobType.includes(job.employment_type)
            );
        }

        // Apply experience level filters
        if (this.currentFilters.experienceLevel.length > 0) {
            filtered = filtered.filter(job => 
                this.currentFilters.experienceLevel.includes(job.experience_level)
            );
        }

        // Apply salary range filters
        if (this.currentFilters.salaryRange.length > 0) {
            filtered = filtered.filter(job => {
                if (!job.salary_min || !job.salary_max) return false;
                
                return this.currentFilters.salaryRange.some(range => {
                    return this.isJobInSalaryRange(job, range);
                });
            });
        }

        this.filteredJobs = filtered;
        this.sortAndDisplayJobs();
        this.updateResultsCount();
    }

    isJobInSalaryRange(job, range) {
        const salary = (job.salary_min + job.salary_max) / 2;
        
        switch (range) {
            case '30k-50k':
                return salary >= 30000 && salary <= 50000;
            case '50k-75k':
                return salary >= 50000 && salary <= 75000;
            case '75k-100k':
                return salary >= 75000 && salary <= 100000;
            case '100k+':
                return salary >= 100000;
            default:
                return false;
        }
    }

    updateFilters() {
        // Update job type filters
        this.currentFilters.jobType = Array.from(
            document.querySelectorAll('input[value="full-time"]:checked, input[value="part-time"]:checked, input[value="contract"]:checked, input[value="freelance"]:checked')
        ).map(cb => cb.value);

        // Update experience level filters
        this.currentFilters.experienceLevel = Array.from(
            document.querySelectorAll('input[value="entry"]:checked, input[value="mid"]:checked, input[value="senior"]:checked, input[value="executive"]:checked')
        ).map(cb => cb.value);

        // Update salary range filters
        this.currentFilters.salaryRange = Array.from(
            document.querySelectorAll('input[value="30k-50k"]:checked, input[value="50k-75k"]:checked, input[value="75k-100k"]:checked, input[value="100k+"]:checked')
        ).map(cb => cb.value);
    }

    sortAndDisplayJobs() {
        // Sort jobs based on current sort option
        this.sortJobs();
        
        // Reset page and display
        this.currentPage = 1;
        this.displayJobs();
    }

    sortJobs() {
        switch (this.currentFilters.sortBy) {
            case 'newest':
                this.filteredJobs.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
                break;
            case 'salary-high':
                this.filteredJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
                break;
            case 'salary-low':
                this.filteredJobs.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
                break;
            case 'company':
                this.filteredJobs.sort((a, b) => a.company.localeCompare(b.company));
                break;
            case 'relevance':
            default:
                // Keep original order for relevance
                break;
        }
    }

    displayJobs() {
        const jobListings = document.getElementById('jobListings');
        const loadingState = document.getElementById('loadingState');
        const noResults = document.getElementById('noResults');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (!jobListings) return;

        // Hide loading state
        if (loadingState) loadingState.style.display = 'none';

        if (this.filteredJobs.length === 0) {
            // Show no results
            jobListings.style.display = 'none';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        // Hide no results
        if (noResults) noResults.style.display = 'none';

        // Calculate jobs to show
        const jobsToShow = this.filteredJobs.slice(0, this.currentPage * this.pageSize);
        
        // Render jobs
        jobListings.innerHTML = jobsToShow.map(job => this.createJobCard(job)).join('');
        jobListings.style.display = 'block';

        // Show/hide load more button
        if (loadMoreContainer) {
            const hasMoreJobs = this.filteredJobs.length > this.currentPage * this.pageSize;
            loadMoreContainer.style.display = hasMoreJobs ? 'block' : 'none';
        }

        // Setup job card event listeners
        this.setupJobCardListeners();
    }

    createJobCard(job) {
        const salaryText = this.formatSalary(job);
        const locationText = this.formatLocation(job);
        const timeAgo = this.formatTimeAgo(job.posted_date);

        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <div class="job-title-company">
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                    </div>
                    <div class="job-salary">${salaryText}</div>
                </div>
                <div class="job-description">
                    <p>${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
                </div>
                <div class="job-meta">
                    <span class="job-location"><i class="fas fa-map-marker-alt"></i> ${locationText}</span>
                    <span class="job-type"><i class="fas fa-clock"></i> ${job.employment_type || 'Full-time'}</span>
                    <span class="job-posted"><i class="fas fa-calendar"></i> ${timeAgo}</span>
                </div>
                <div class="job-actions">
                    <button class="btn btn-outline-primary save-job-btn" data-job-id="${job.id}">
                        <i class="fas fa-heart"></i> Save
                    </button>
                    <button class="btn btn-primary apply-job-btn" data-job-id="${job.id}">
                        Apply Now
                    </button>
                </div>
            </div>
        `;
    }

    formatSalary(job) {
        if (job.salary_min && job.salary_max) {
            return `$${this.formatNumber(job.salary_min)} - $${this.formatNumber(job.salary_max)}`;
        } else if (job.salary_min) {
            return `$${this.formatNumber(job.salary_min)}+`;
        } else if (job.salary_max) {
            return `Up to $${this.formatNumber(job.salary_max)}`;
        }
        return 'Competitive';
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatLocation(job) {
        if (job.remote_type === 'fully_remote') {
            return 'Remote';
        } else if (job.remote_type === 'hybrid') {
            return `${job.location} (Hybrid)`;
        }
        return job.location;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
    }

    setupJobCardListeners() {
        // Save job buttons
        document.querySelectorAll('.save-job-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-job-id');
                this.handleSaveJob(jobId);
            });
        });

        // Apply job buttons
        document.querySelectorAll('.apply-job-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-job-id');
                this.handleApplyJob(jobId);
            });
        });

        // Job card clicks
        document.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.job-actions')) {
                    const jobId = card.getAttribute('data-job-id');
                    this.handleJobClick(jobId);
                }
            });
        });
    }

    loadMoreJobs() {
        this.currentPage++;
        this.displayJobs();
    }

    handleSaveJob(jobId) {
        console.log('Saving job:', jobId);
        // Implement save job functionality
        alert('Job saved! (Feature to be implemented)');
    }

    handleApplyJob(jobId) {
        console.log('Applying to job:', jobId);
        
        // Store the job ID they want to apply to
        localStorage.setItem('intended_job_id', jobId.toString());
        
        // Open registration modal
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        authModal.show();
        
        // Switch to register tab
        const registerTab = document.querySelector('#authModal .nav-link[href="#register"]');
        if (registerTab) {
            registerTab.click();
        }
    }

    handleJobClick(jobId) {
        console.log('Job clicked:', jobId);
        // Navigate to job details page
        window.location.href = `/job-details?id=${jobId}`;
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredJobs?.length || 0;
            const searchText = this.currentFilters.search ? ` for "${this.currentFilters.search}"` : '';
            resultsCount.textContent = `Found ${count} job${count !== 1 ? 's' : ''}${searchText}`;
        }
    }

    updateUrl() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.search) {
            params.append('q', this.currentFilters.search);
        }
        
        if (this.currentFilters.location) {
            params.append('location', this.currentFilters.location);
        }
        
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const jobListings = document.getElementById('jobListings');
        
        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
        
        if (jobListings && show) {
            jobListings.style.display = 'none';
        }
    }

    showError(message) {
        const jobListings = document.getElementById('jobListings');
        if (jobListings) {
            jobListings.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mb-0">${message}</p>
                </div>
            `;
            jobListings.style.display = 'block';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the job search results page
    if (document.body.classList.contains('page-job-results')) {
        window.jobSearchResultsPage = new JobSearchResultsPage();
    }
});

// Export for global access
window.JobSearchResultsPage = JobSearchResultsPage;
