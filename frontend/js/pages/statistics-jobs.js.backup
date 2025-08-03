// Statistics Page - Dynamic Modal Job Management
// Displays a sample job in the statistics modal

class StatisticsJobManager {
    constructor() {
        this.jobCard = new JobCard({
            displayMode: 'featured',
            showSaveButton: false,
            showApplyButton: true,
            showViewsCount: false,
            truncateDescription: true
        });
        this.modalContainer = null;
    }

    // Initialize the statistics job system
    async init() {
        console.log('🚀 Initializing Statistics Job Manager');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Find the modal job container
        this.modalContainer = document.querySelector('#sampleJobModal .modal-body, .job-sample-container');
        if (!this.modalContainer) {
            console.log('ℹ️ Statistics job modal container not found - this is optional');
            return;
        }

        console.log('✅ Statistics job modal container found');

        // Load sample job when modal is shown
        this.setupModalEvents();
    }

    // Setup modal event handlers
    setupModalEvents() {
        // Find modal element
        const modal = document.querySelector('#sampleJobModal, .modal');
        if (!modal) return;

        // Load job when modal is shown
        modal.addEventListener('show.bs.modal', async () => {
            await this.loadSampleJob();
        });
    }

    // Load and display a sample job
    async loadSampleJob() {
        console.log('📋 Loading sample job for statistics modal');
        this.showLoading();

        try {
            // Fetch a featured job or random job
            let response = await fetch('/api/jobs?is_featured=true&limit=1&is_active=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let data = await response.json();

            // If no featured jobs, get any job
            if (!data.jobs || data.jobs.length === 0) {
                response = await fetch('/api/jobs?limit=1&is_active=true');
                data = await response.json();
            }

            if (!data.jobs || data.jobs.length === 0) {
                this.showEmptyState();
                return;
            }

            // Render the sample job
            this.renderJob(data.jobs[0]);

            console.log('✅ Sample job loaded successfully');

        } catch (error) {
            console.error('❌ Error loading sample job:', error);
            this.showError();
        }
    }

    // Show loading state
    showLoading() {
        if (!this.modalContainer) return;
        
        this.modalContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading job...</span>
                </div>
                <p class="mt-2 text-muted">Loading sample job...</p>
            </div>
        `;
    }

    // Show error state
    showError() {
        if (!this.modalContainer) return;
        
        this.modalContainer.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Oops!</strong> Couldn't load sample job right now.
            </div>
        `;
    }

    // Show empty state
    showEmptyState() {
        if (!this.modalContainer) return;
        
        this.modalContainer.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-briefcase me-2"></i>
                <strong>No jobs available</strong><br>
                Check back soon for new opportunities!
            </div>
        `;
    }

    // Render job using the job card component
    renderJob(job) {
        if (!this.modalContainer) return;

        // Create a wrapper that looks good in modal
        const jobCardHtml = this.jobCard.render(job);
        
        this.modalContainer.innerHTML = `
            <div class="row">
                <div class="col-12">
                    ${jobCardHtml}
                </div>
            </div>
            <div class="text-center mt-3">
                <button class="btn btn-primary" id="view-job-details-btn" data-job-id="${job.id}">
                    <i class="fas fa-eye me-2"></i>View Full Details
                </button>
            </div>
        `;

        // Add event listener for view details button
        const viewDetailsBtn = this.modalContainer.querySelector('#view-job-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                const jobId = viewDetailsBtn.getAttribute('data-job-id');
                window.location.href = `job-details.html?id=${jobId}`;
            });
        }

        // Ensure the job card click handler works
        const jobCard = this.modalContainer.querySelector('.job-card, .card');
        if (jobCard) {
            jobCard.style.cursor = 'pointer';
            jobCard.addEventListener('click', () => {
                window.location.href = `job-details.html?id=${job.id}`;
            });
        }
    }

    // Get a random job for demonstrations
    async getRandomJob() {
        try {
            const response = await fetch('/api/jobs?limit=1&is_active=true');
            const data = await response.json();
            return data.jobs?.[0] || null;
        } catch (error) {
            console.error('Error fetching random job:', error);
            return null;
        }
    }
}

// Global instance
let statisticsJobManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for JobCard component to be available
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        // Load job card component if not already loaded
        const script = document.createElement('script');
        script.src = 'js/components/job-card.js';
        script.onload = async () => {
            statisticsJobManager = new StatisticsJobManager();
            await statisticsJobManager.init();
        };
        document.head.appendChild(script);
    } else {
        statisticsJobManager = new StatisticsJobManager();
        await statisticsJobManager.init();
    }
});

// Export for global access
window.statisticsJobManager = statisticsJobManager;
