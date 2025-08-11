


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

    
    async init() {
        console.log('🚀 Initializing Index Jobs Manager');
        
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        
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

        
        this.createErrorElement();

        
        await this.loadFeaturedJobs();
    }

    
    createErrorElement() {
        
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

    
    setupEventListeners() {
        
        const retryBtn = this.errorElement.querySelector('#retry-featured-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadFeaturedJobs());
        }
    }

    
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

    
    hideLoading() {
        console.log('✅ Hiding loading state for featured jobs');
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        if (this.container) {
            this.container.style.display = 'flex'; 
        }
    }

    
    showError(message = null) {
        console.log('❌ Showing error state for featured jobs');
        
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

    
    async loadFeaturedJobs() {
        console.log('⭐ Loading featured jobs for homepage from static database');
        this.showLoading();

        try {
            // Check if jobs database is available
            if (typeof window.JOBS_DATABASE === 'undefined') {
                throw new Error('Jobs database not loaded');
            }

            // Get featured jobs first
            let featuredJobs = window.JOBS_DATABASE.filter(job => job.is_featured === true);
            console.log(`🎯 Found ${featuredJobs.length} featured jobs in database`);
            
            // Create a balanced selection with 1 CDOT job for every 2 non-CDOT jobs
            let jobsToShow = [];
            let cdotJobs = featuredJobs.filter(job => job.company_name === 'CDOT');
            let nonCdotJobs = featuredJobs.filter(job => job.company_name !== 'CDOT');
            
            // If no featured jobs or need more variety, include regular jobs
            if (featuredJobs.length < 6) {
                const regularJobs = window.JOBS_DATABASE.filter(job => job.is_featured !== true);
                const additionalCdot = regularJobs.filter(job => job.company_name === 'CDOT');
                const additionalNonCdot = regularJobs.filter(job => job.company_name !== 'CDOT');
                
                cdotJobs = [...cdotJobs, ...additionalCdot];
                nonCdotJobs = [...nonCdotJobs, ...additionalNonCdot];
            }
            
            // Create balanced selection: 1 CDOT for every 2 other companies
            let cdotIndex = 0;
            let nonCdotIndex = 0;
            let targetCount = 6;
            
            for (let i = 0; i < targetCount; i++) {
                if (i % 3 === 0 && cdotIndex < cdotJobs.length) {
                    // Every 3rd job (positions 0, 3) should be CDOT
                    jobsToShow.push(cdotJobs[cdotIndex]);
                    cdotIndex++;
                } else if (nonCdotIndex < nonCdotJobs.length) {
                    // Other positions get non-CDOT jobs
                    jobsToShow.push(nonCdotJobs[nonCdotIndex]);
                    nonCdotIndex++;
                } else if (cdotIndex < cdotJobs.length) {
                    // If we run out of non-CDOT, fill with CDOT
                    jobsToShow.push(cdotJobs[cdotIndex]);
                    cdotIndex++;
                } else {
                    // No more jobs available
                    break;
                }
            }
            
            console.log(`✅ Balanced selection: ${jobsToShow.filter(j => j.company_name === 'CDOT').length} CDOT jobs, ${jobsToShow.filter(j => j.company_name !== 'CDOT').length} other company jobs`);

            console.log(`✅ Total jobs to display: ${jobsToShow.length}`);

            if (jobsToShow.length === 0) {
                this.showEmptyState();
                return;
            }

            // Clear container and render jobs
            this.container.innerHTML = '';
            
            for (const job of jobsToShow) {
                try {
                    const jobCardHtml = this.jobCard.render(job);
                    
                    // Create a wrapper div for Bootstrap grid
                    const jobWrapper = document.createElement('div');
                    jobWrapper.className = 'col-lg-4 col-md-6 col-12';
                    jobWrapper.innerHTML = jobCardHtml;
                    
                    this.container.appendChild(jobWrapper);
                } catch (error) {
                    console.error('❌ Error rendering job card:', error, job);
                }
            }

            this.hideLoading();
            console.log('✅ Featured jobs loaded successfully from static database');

        } catch (error) {
            console.error('❌ Error loading featured jobs:', error);
            this.showError(error.message || 'Failed to load featured jobs');
        }
    }

    
    async refresh() {
        await this.loadFeaturedJobs();
    }
}


let indexJobsManager;


document.addEventListener('DOMContentLoaded', async () => {
    
    if (typeof JobCard === 'undefined') {
        console.log('⏳ Waiting for JobCard component...');
        
        
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


window.indexJobsManager = indexJobsManager;
