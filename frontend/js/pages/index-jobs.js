// Index Page - Featured Jobs Management
// Fetches and displays featured jobs for the homepage

class IndexJobsManager {
    constructor() {
        this.jobCard = new JobCard({
            displayMode: 'grid',
            showSaveButton: true,
            showApplyButton: true,
            showViewsCount: true,
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

        // Find the existing HTML elements
        this.container = document.querySelector('#featured-jobs');
        this.loadingElement = document.querySelector('#featured-jobs-loading');
        
        if (!this.container) {
            console.error('❌ Featured jobs container (#featured-jobs) not found');
            return;
        }

        if (!this.loadingElement) {
            console.error('❌ Loading element (#featured-jobs-loading) not found');
            return;
        }

        console.log('✅ Featured jobs elements found');

        // Create error element for dynamic use
        this.createErrorElement();

        // Load featured jobs
        await this.loadFeaturedJobs();
    }

    // Create error status element
    createErrorElement() {
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
        console.log('⏳ Showing loading state for featured jobs');
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        if (this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }

    // Hide loading state
    hideLoading() {
        console.log('✅ Hiding loading state for featured jobs');
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        if (this.container) {
            this.container.style.display = 'flex'; // Use flex to enable Bootstrap grid
        }
    }

    // Show error state
    showError(message = null) {
        console.log('❌ Showing error state for featured jobs');
        // Hide loading
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        
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
        
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(this.errorElement);
            this.container.style.display = 'block';
        }
    }

    // Show empty state
    showEmptyState() {
        console.log('📭 Showing empty state for featured jobs');
        this.hideLoading();
        
        if (this.container) {
            this.container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="alert alert-info">
                        <i class="fas fa-briefcase me-2"></i>
                        <strong>No featured jobs available</strong><br>
                        Check back soon for new opportunities!
                    </div>
                </div>
            `;
            this.container.style.display = 'block';
        }
    }

    // Load and display featured jobs
    async loadFeaturedJobs() {
        console.log('⭐ Loading featured jobs for homepage');
        this.showLoading();

        try {
            // First try to fetch featured jobs
            const featuredResponse = await fetch('/api/jobs?is_featured=true&limit=6&is_active=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!featuredResponse.ok) {
                throw new Error(`HTTP error! status: ${featuredResponse.status}`);
            }

            const featuredData = await featuredResponse.json();
            console.log('✅ Featured jobs data received:', featuredData);

            let jobsToShow = [];
            
            // If we have featured jobs, use them
            if (featuredData.jobs && featuredData.jobs.length > 0) {
                jobsToShow = featuredData.jobs;
                console.log(`🎯 Found ${jobsToShow.length} featured jobs`);
            }

            // If we need more jobs to reach 6, fetch regular jobs
            if (jobsToShow.length < 6) {
                console.log(`🔄 Need ${6 - jobsToShow.length} more jobs, fetching regular jobs`);
                const regularResponse = await fetch(`/api/jobs?limit=${6 - jobsToShow.length}&is_active=true`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (regularResponse.ok) {
                    const regularData = await regularResponse.json();
                    if (regularData.jobs && regularData.jobs.length > 0) {
                        // Filter out any jobs that are already in our featured list
                        const featuredIds = jobsToShow.map(job => job.id);
                        const newJobs = regularData.jobs.filter(job => !featuredIds.includes(job.id));
                        jobsToShow = [...jobsToShow, ...newJobs].slice(0, 6); // Ensure max 6 jobs
                        console.log(`📋 Added ${newJobs.length} regular jobs`);
                    }
                }
            }

            if (jobsToShow.length === 0) {
                this.showEmptyState();
                return;
            }

            // Render all jobs
            this.renderJobs(jobsToShow);
            console.log(`🎯 Successfully loaded ${jobsToShow.length} jobs for homepage`);

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

            // Render regular jobs (ensure we get up to 6)
            this.renderJobs(data.jobs);
            console.log(`📋 Loaded ${data.jobs.length} regular jobs as fallback`);

        } catch (error) {
            console.error('❌ Error loading regular jobs:', error);
            this.showError(error.message);
        }
    }

    // Render jobs using the job card component
    renderJobs(jobs) {
        console.log(`🎨 Rendering ${jobs.length} featured jobs`);
        
        // Hide loading and show container
        this.hideLoading();
        
        // Clear container
        this.container.innerHTML = '';
        
        // Ensure the container has proper Bootstrap row classes
        this.container.className = 'row g-4 mb-4';
        this.container.style.display = 'flex';

        // Create job cards
        jobs.forEach((job, index) => {
            const jobCardHtml = this.jobCard.render(job);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
            cardWrapper.innerHTML = jobCardHtml;
            
            // Add staggered animation
            const card = cardWrapper.querySelector('.job-card, .card');
            if (card) {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in-up');
            }
            
            this.container.appendChild(cardWrapper);
        });

        // Set up event listeners for job card interactions (includes authentication)
        this.jobCard.setupEventListeners(this.container);
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
