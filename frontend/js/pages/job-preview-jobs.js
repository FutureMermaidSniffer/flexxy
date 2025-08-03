


class JobPreviewManager {
    constructor() {
        this.jobCard = new JobCard({
            displayMode: 'grid',
            showSaveButton: true,
            showApplyButton: true,
            showViewsCount: false,
            truncateDescription: true
        });
        this.container = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    
    async init() {
        console.log('🚀 Initializing Job Preview Manager');
        
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        
        this.container = document.querySelector('.job-cards-grid');
        if (!this.container) {
            console.error('❌ Job cards container (.job-cards-grid) not found');
            return;
        }

        
        this.createStatusElements();

        
        await this.loadJobs();
    }

    
    createStatusElements() {
        
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'col-12 text-center py-5';
        this.loadingElement.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading jobs...</span>
            </div>
            <p class="mt-3 text-muted">Finding your perfect job matches...</p>
        `;

        
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'col-12 text-center py-5';
        this.errorElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Oops!</strong> We couldn't load job matches right now.
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-preview-jobs-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            </div>
        `;
    }

    
    showLoading() {
        this.container.innerHTML = '';
        this.container.appendChild(this.loadingElement);
    }

    
    showError(message = null) {
        if (message) {
            this.errorElement.querySelector('.alert').innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br>
                <button class="btn btn-primary btn-sm mt-2" id="retry-preview-jobs-btn">
                    <i class="fas fa-redo me-1"></i> Try Again
                </button>
            `;
        }
        this.container.innerHTML = '';
        this.container.appendChild(this.errorElement);
        
        
        const retryBtn = this.errorElement.querySelector('#retry-preview-jobs-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadJobs());
        }
    }

    
    showEmptyState() {
        this.container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-search me-2"></i>
                    <strong>No jobs found</strong><br>
                    We couldn't find any job matches at the moment. Try again later!
                </div>
            </div>
        `;
    }

    
    async loadJobs() {
        console.log('📋 Loading jobs for preview page');
        this.showLoading();

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
            console.log('✅ Jobs data received:', data);

            if (!data.jobs || data.jobs.length === 0) {
                this.showEmptyState();
                this.updateJobCount(0);
                return;
            }

            
            this.renderJobs(data.jobs);
            
            
            this.updateJobCount(data.pagination?.total || data.jobs.length);

            console.log(`🎯 Successfully loaded ${data.jobs.length} jobs`);

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
            cardWrapper.className = 'col-lg-4 col-md-6 mb-4';
            cardWrapper.innerHTML = jobCardHtml;
            
            
            const card = cardWrapper.querySelector('.job-card, .card');
            if (card) {
                card.style.animationDelay = `${(index + 1) * 0.1}s`;
            }
            
            this.container.appendChild(cardWrapper);
        });
    }

    
    updateJobCount(count) {
        const countElement = document.querySelector('.match-count strong');
        if (countElement) {
            countElement.textContent = `${count} jobs`;
        }

        
        const altCountElement = document.querySelector('.match-stats .match-count');
        if (altCountElement && count > 0) {
            altCountElement.innerHTML = `
                <i class="fas fa-check-circle text-success me-2"></i>
                <strong>${count} jobs</strong> match your criteria
            `;
        }
    }

    
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


let jobPreviewManager;


document.addEventListener('DOMContentLoaded', async () => {
    
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        
        const script = document.createElement('script');
        script.src = 'js/components/job-card.js';
        script.onload = async () => {
            jobPreviewManager = new JobPreviewManager();
            await jobPreviewManager.init();
        };
        document.head.appendChild(script);
    } else {
        jobPreviewManager = new JobPreviewManager();
        await jobPreviewManager.init();
    }
});


window.jobPreviewManager = jobPreviewManager;
