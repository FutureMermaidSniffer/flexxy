// Index Page - Featured Jobs Management
// Fetches and displays featured jobs f    // Show error state for featured jobs
    showError(message = null) {
        if (message) {
            this.errorElement.querySelector('.alert').innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-featured-jobs-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            `;
        }
        this.container.innerHTML = '';
        this.container.appendChild(this.errorElement);
        
        // Add event listener for retry button
        const retryBtn = this.errorElement.querySelector('#retry-featured-jobs-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadFeaturedJobs());
        }
    }

class IndexJobsManager {
    constructor() {
        this.jobCard = new JobCard({
            displayMode: 'featured',
            showSaveButton: true,
            showApplyButton: true,
            showViewsCount: false,
            truncateDescription: true
        });
        this.container = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    // Initialize the featured jobs system
    async init() {
        console.log('🚀 Initializing Index Jobs Manager');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Find the featured jobs container - look for the parent of job cards
        this.container = document.querySelector('#featured-jobs .row');
        if (!this.container) {
            // Try alternative selectors
            this.container = document.querySelector('.featured-jobs .row');
            if (!this.container) {
                console.error('❌ Featured jobs container not found');
                return;
            }
        }

        console.log('✅ Featured jobs container found:', this.container);

        // Create status elements
        this.createStatusElements();

        // Set up event listeners
        this.setupEventListeners();

        // Load featured jobs
        await this.loadFeaturedJobs();
    }

    // Create loading and error status elements
    createStatusElements() {
        // Loading spinner
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'col-12 text-center py-5';
        this.loadingElement.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading featured jobs...</span>
            </div>
            <p class="mt-3 text-muted">Loading top job opportunities...</p>
        `;

        // Error state
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'col-12 text-center py-4';
        this.errorElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Oops!</strong> Couldn't load featured jobs right now.
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-featured-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            </div>
        `;
    }

    // Set up event listeners for static elements
    setupEventListeners() {
        // Add listener for the basic retry button
        const retryBtn = this.errorElement.querySelector('#retry-featured-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadFeaturedJobs());
        }
    }

    // Show loading state
    showLoading() {
        this.container.innerHTML = '';
        this.container.appendChild(this.loadingElement);
    }

    // Show error state
    showError(message = null) {
        if (message) {
            this.errorElement.querySelector('.alert').innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-featured-error-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            `;
            
            // Add event listener for retry button
            setTimeout(() => {
                const retryBtn = this.errorElement.querySelector('#retry-featured-error-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => this.loadFeaturedJobs());
                }
            }, 100);
        }
        this.container.innerHTML = '';
        this.container.appendChild(this.errorElement);
    }

    // Show empty state
    showEmptyState() {
        this.container.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-info">
                    <i class="fas fa-briefcase me-2"></i>
                    <strong>No featured jobs available</strong><br>
                    Check back soon for new opportunities!
                </div>
            </div>
        `;
    }

    // Load and display featured jobs
    async loadFeaturedJobs() {
        console.log('⭐ Loading featured jobs for homepage');
        this.showLoading();

        try {
            // Fetch featured jobs (limit 6 for homepage)
            const response = await fetch('/api/jobs?is_featured=true&limit=6&is_active=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Featured jobs data received:', data);

            if (!data.jobs || data.jobs.length === 0) {
                // If no featured jobs, get regular jobs
                console.log('🔄 No featured jobs found, loading regular jobs');
                await this.loadRegularJobs();
                return;
            }

            // Render featured job cards
            this.renderJobs(data.jobs);

            console.log(`🎯 Successfully loaded ${data.jobs.length} featured jobs`);

        } catch (error) {
            console.error('❌ Error loading featured jobs:', error);
            this.showError(error.message);
        }
    }

    // Fallback: Load regular jobs if no featured jobs available
    async loadRegularJobs() {
        try {
            const response = await fetch('/api/jobs?limit=6&is_active=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.jobs || data.jobs.length === 0) {
                this.showEmptyState();
                return;
            }

            // Render regular jobs
            this.renderJobs(data.jobs);
            console.log(`📋 Loaded ${data.jobs.length} regular jobs as fallback`);

        } catch (error) {
            console.error('❌ Error loading regular jobs:', error);
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
            cardWrapper.className = 'col-lg-4 col-md-6 mb-4';
            cardWrapper.innerHTML = jobCardHtml;
            
            // Replace the modal trigger with actual job details navigation
            const card = cardWrapper.querySelector('.card, .job-card');
            if (card) {
                // Remove modal trigger attributes
                card.removeAttribute('data-bs-toggle');
                card.removeAttribute('data-bs-target');
                
                // Add proper click handler
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    window.location.href = `job-details.html?id=${job.id}`;
                });
            }
            
            this.container.appendChild(cardWrapper);
        });
    }

    // Refresh featured jobs
    async refresh() {
        await this.loadFeaturedJobs();
    }
}

// Global instance
let indexJobsManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for JobCard component to be available
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        // Try to find and load job card component
        const existingScript = document.querySelector('script[src*="job-card.js"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'js/components/job-card.js';
            script.onload = async () => {
                indexJobsManager = new IndexJobsManager();
                await indexJobsManager.init();
            };
            document.head.appendChild(script);
        } else {
            // Component should be loaded, wait a bit and try again
            setTimeout(async () => {
                indexJobsManager = new IndexJobsManager();
                await indexJobsManager.init();
            }, 100);
        }
    } else {
        indexJobsManager = new IndexJobsManager();
        await indexJobsManager.init();
    }
});

// Export for global access
window.indexJobsManager = indexJobsManager;
