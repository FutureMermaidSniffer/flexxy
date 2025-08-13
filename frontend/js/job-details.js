


class JobDetails {
    constructor() {
        this.jobId = null;
        this.jobData = null;
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.contentState = document.getElementById('jobDetailsContent');
        this.init();
    }

    
    init() {
        console.log('🚀 Initializing Job Details Page');
        
        
        this.jobId = this.getJobIdFromUrl();
        
        if (!this.jobId) {
            this.showError('No job ID provided');
            return;
        }

        console.log(`📋 Loading job details for ID: ${this.jobId}`);
        
        
        this.loadJobDetails();
    }

    
    getJobIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : null;
    }

    
    showLoading() {
        if (this.loadingState) this.loadingState.style.display = 'flex';
        if (this.errorState) this.errorState.style.display = 'none';
        if (this.contentState) this.contentState.style.display = 'none';
    }

    
    showError(message = 'Job not found') {
        if (this.loadingState) this.loadingState.style.display = 'none';
        if (this.errorState) this.errorState.style.display = 'flex';
        if (this.contentState) this.contentState.style.display = 'none';
        
        console.error('❌ Job Details Error:', message);
    }

    
    showContent() {
        if (this.loadingState) this.loadingState.style.display = 'none';
        if (this.errorState) this.errorState.style.display = 'none';
        if (this.contentState) this.contentState.style.display = 'block';
    }

    
    async loadJobDetails() {
        this.showLoading();

        try {
            // Wait for jobs database to be available
            if (typeof JobsDatabase === 'undefined') {
                // Try to load the jobs database script if not already loaded
                await this.loadJobsDatabase();
            }
            
            // Get job from static database
            const job = JobsDatabase.getJobById(this.jobId);
            
            if (!job) {
                this.showError('Job not found');
                return;
            }

            this.jobData = job;
            console.log('✅ Job data loaded from static database:', this.jobData);
            
            // Render the job details
            this.renderJobDetails();
            this.showContent();
            
            // Update page title
            document.title = `${this.jobData.title} - ${this.jobData.company_name} | FlexJobs`;

        } catch (error) {
            console.error('❌ Error loading job details:', error);
            this.showError('Failed to load job details');
        }
    }
    
    // Load jobs database script if not already loaded
    async loadJobsDatabase() {
        return new Promise((resolve, reject) => {
            if (typeof JobsDatabase !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'js/data/jobs-database.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    
    renderJobDetails() {
        const job = this.jobData;
        
        
        this.updateElement('jobTitle', job.title);
        this.updateElement('companyName', job.company_name);
        this.updateElement('sidebarCompanyName', job.company_name);
        
        
        const logoUrl = job.company_logo || 'images/logo.png';
        this.updateElement('companyLogo', logoUrl, 'src');
        this.updateElement('sidebarCompanyLogo', logoUrl, 'src');
        
        
        this.updateElement('jobLocation', `${job.location || 'Remote'}`);
        this.updateElement('jobType', this.formatJobType(job.job_type));
        this.updateElement('remoteType', this.formatRemoteType(job.remote_type));
        this.updateElement('postedDate', this.formatTimeAgo(job.created_at));
        
        
        const salaryText = this.formatSalary(job);
        this.updateElement('salaryRange', salaryText);
        
        
        this.updateElement('jobDescription', this.formatContent(job.description), 'innerHTML');
        this.updateElement('jobRequirements', this.formatContent(job.requirements), 'innerHTML');
        
        
        if (job.benefits && this.hasContent(job.benefits)) {
            this.updateElement('jobBenefits', this.formatContent(job.benefits), 'innerHTML');
            const benefitsSection = document.getElementById('benefitsSection');
            if (benefitsSection) benefitsSection.style.display = 'block';
        } else {
            const benefitsSection = document.getElementById('benefitsSection');
            if (benefitsSection) benefitsSection.style.display = 'none';
        }
        
        
        this.updateElement('experienceLevel', this.formatExperienceLevel(job.experience_level));
        this.updateElement('employmentType', this.formatJobType(job.job_type));
        this.updateElement('workStyle', this.formatRemoteType(job.remote_type));
        this.updateElement('jobCategory', job.category_name || 'General');
        
        
        this.updateElement('companySize', job.company_size || 'Not specified');
        this.updateElement('companyDescription', job.company_description || 'No description available');
        
        
        const companyWebsite = job.company_website;
        const websiteBtn = document.getElementById('viewCompanyWebsite');
        if (companyWebsite && websiteBtn) {
            websiteBtn.href = companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`;
            websiteBtn.style.display = 'inline-block';
        } else if (websiteBtn) {
            websiteBtn.style.display = 'none';
        }
        
        
        this.setupApplicationButton();
    }

    
    setupApplicationButton() {
        const applyBtn = document.getElementById('applyBtn');
        const job = this.jobData;
        
        if (!applyBtn) {
            console.error('Apply button not found');
            return;
        }
        
        // Remove any existing event listeners by cloning the button
        const newApplyBtn = applyBtn.cloneNode(true);
        applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
        
        if (job.application_url && job.application_url.trim()) {
            
            const cleanUrl = job.application_url.trim();
            const applicationUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
            
            newApplyBtn.href = applicationUrl;
            newApplyBtn.target = '_blank';
            newApplyBtn.rel = 'noopener noreferrer';
            newApplyBtn.innerHTML = `
                <i class="fas fa-external-link-alt me-2"></i>Apply Now
            `;
            
            newApplyBtn.addEventListener('click', () => {
                console.log(`🔗 External application click: ${applicationUrl}`);
                this.trackApplicationClick();
            });
            
            console.log(`🔗 External application URL configured: ${applicationUrl}`);
        } else {
            
            newApplyBtn.href = '#';
            newApplyBtn.target = '_self';
            newApplyBtn.removeAttribute('rel');
            newApplyBtn.innerHTML = `
                <i class="fas fa-paper-plane me-2"></i>Apply Now
            `;
            
            
            newApplyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showInternalApplicationForm();
            });
            
            console.log('📧 Internal application form configured');
        }
    }

    
    async trackApplicationClick() {
        try {
            await fetch(`/api/jobs/${this.jobId}/track-application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.log('Analytics tracking failed:', error);
        }
    }

    
    showInternalApplicationForm() {
        
        localStorage.setItem('intended_job_id', this.jobId.toString());
        
        
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        authModal.show();
        
        
        const registerTab = document.querySelector('#authModal .nav-link[href="#register"]');
        if (registerTab) {
            registerTab.click();
        }
        
        console.log('🎯 Opening registration modal for job application, job:', this.jobData.title);
    }

    
    updateElement(id, value, attribute = 'textContent') {
        const element = document.getElementById(id);
        if (element && value !== null && value !== undefined) {
            if (attribute === 'textContent') {
                element.textContent = value;
            } else if (attribute === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(attribute, value);
            }
        }
    }

    
    formatSalary(job) {
        if (job.salary_min && job.salary_max) {
            const currency = job.salary_currency || 'USD';
            const symbol = currency === 'USD' ? '$' : currency;
            return `${symbol}${this.formatNumber(job.salary_min)} - ${symbol}${this.formatNumber(job.salary_max)}`;
        } else if (job.salary_min) {
            const currency = job.salary_currency || 'USD';
            const symbol = currency === 'USD' ? '$' : currency;
            return `From ${symbol}${this.formatNumber(job.salary_min)}`;
        } else {
            return 'Salary not specified';
        }
    }

    
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    
    hasContent(content) {
        if (!content) return false;
        
        if (typeof content === 'string') {
            return content.trim().length > 0;
        } else if (Array.isArray(content)) {
            return content.length > 0 && content.some(item => item && String(item).trim().length > 0);
        } else if (typeof content === 'object') {
            return Object.keys(content).length > 0;
        } else {
            return String(content).trim().length > 0;
        }
    }

    
    formatContent(content) {
        if (!content) return 'Not specified';
        
        // Handle different content types
        let contentString = '';
        if (typeof content === 'string') {
            contentString = content;
        } else if (Array.isArray(content)) {
            contentString = content.join('\n');
        } else if (typeof content === 'object') {
            contentString = JSON.stringify(content);
        } else {
            contentString = String(content);
        }
        
        
        return contentString
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    
    formatJobType(type) {
        const types = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'freelance': 'Freelance',
            'internship': 'Internship'
        };
        return types[type] || type;
    }

    
    formatRemoteType(type) {
        const types = {
            'remote': 'Remote',
            'hybrid': 'Hybrid',
            'on-site': 'On-site'
        };
        return types[type] || type;
    }

    
    formatExperienceLevel(level) {
        const levels = {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level',
            'executive': 'Executive'
        };
        return levels[level] || level;
    }

    
    formatTimeAgo(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Less than an hour ago';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        new JobDetails();
    }, 100);
});


window.JobDetails = JobDetails;