// Job Details functionality
class JobDetails {
    constructor() {
        this.jobId = null;
        this.jobData = null;
        this.init();
    }

    init() {
        // Get job ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.jobId = urlParams.get('id');
        
        if (!this.jobId) {
            this.showError();
            return;
        }

        this.loadJobDetails();
        this.bindEvents();
    }

    async loadJobDetails() {
        try {
            const response = await fetch(`/api/jobs/${this.jobId}`);
            
            if (!response.ok) {
                throw new Error('Job not found');
            }

            const data = await response.json();
            this.jobData = data.job || data;
            
            this.renderJobDetails();
            this.loadSimilarJobs();
            
        } catch (error) {
            console.error('Error loading job details:', error);
            this.showError();
        }
    }

    renderJobDetails() {
        const job = this.jobData;
        
        // Update page title
        document.title = `${job.title} - ${job.company_name} | FlexJobs`;
        
        // Update breadcrumb
        document.getElementById('jobBreadcrumb').textContent = job.title;
        
        // Job header
        document.getElementById('jobTitle').textContent = job.title;
        document.getElementById('companyName').textContent = job.company_name;
        document.getElementById('companyLogo').src = job.company_logo || 'images/logo.png';
        document.getElementById('companyLogo').alt = job.company_name;
        
        // Job meta information
        document.getElementById('jobLocation').innerHTML = `<i class="fas fa-map-marker-alt me-1"></i>${job.location || 'Not specified'}`;
        document.getElementById('jobType').innerHTML = `<i class="fas fa-briefcase me-1"></i>${this.formatJobType(job.job_type)}`;
        document.getElementById('remoteType').innerHTML = `<i class="fas fa-laptop me-1"></i>${this.formatRemoteType(job.remote_type)}`;
        document.getElementById('postedDate').innerHTML = `<i class="fas fa-clock me-1"></i>Posted ${this.formatDate(job.created_at)}`;
        
        // Salary
        if (job.salary_min && job.salary_max) {
            document.getElementById('salaryRange').textContent = `$${this.formatSalary(job.salary_min)} - $${this.formatSalary(job.salary_max)}`;
        } else if (job.salary_min) {
            document.getElementById('salaryRange').textContent = `From $${this.formatSalary(job.salary_min)}`;
        } else {
            document.getElementById('salaryRange').textContent = 'Salary not disclosed';
        }
        
        // Job content
        document.getElementById('jobDescription').innerHTML = this.formatContent(job.description);
        document.getElementById('jobRequirements').innerHTML = this.formatContent(job.requirements || 'Requirements will be discussed during the interview process.');
        document.getElementById('jobBenefits').innerHTML = this.formatContent(job.benefits || 'Competitive benefits package available.');
        
        // Skills
        if (job.skills && job.skills.length > 0) {
            const skillsContainer = document.getElementById('jobSkills');
            skillsContainer.innerHTML = job.skills.map(skill => 
                `<span class="skill-tag">${skill}</span>`
            ).join('');
        } else {
            document.getElementById('jobSkills').innerHTML = '<p class="text-muted">Skills will be discussed during the application process.</p>';
        }
        
        // Sidebar information
        document.getElementById('experienceLevel').textContent = this.formatExperienceLevel(job.experience_level);
        document.getElementById('employmentType').textContent = this.formatJobType(job.job_type);
        document.getElementById('workStyle').textContent = this.formatRemoteType(job.remote_type);
        document.getElementById('jobCategory').textContent = job.category_name || 'General';
        
        // Company sidebar
        document.getElementById('sidebarCompanyLogo').src = job.company_logo || 'images/logo.png';
        document.getElementById('sidebarCompanyLogo').alt = job.company_name;
        document.getElementById('sidebarCompanyName').textContent = job.company_name;
        document.getElementById('companySize').textContent = job.company_size || 'Company size not specified';
        document.getElementById('companyDescription').textContent = job.company_description || 'Learn more about this company by visiting their profile.';
        
        // Show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('jobDetailsContent').style.display = 'block';
    }

    async loadSimilarJobs() {
        try {
            const response = await fetch(`/api/jobs?category_id=${this.jobData.category_id}&limit=5&exclude=${this.jobId}`);
            
            if (response.ok) {
                const data = await response.json();
                this.renderSimilarJobs(data.jobs || []);
            }
        } catch (error) {
            console.error('Error loading similar jobs:', error);
        }
    }

    renderSimilarJobs(jobs) {
        const container = document.getElementById('similarJobs');
        
        if (jobs.length === 0) {
            container.innerHTML = '<p class="text-muted small">No similar jobs found.</p>';
            return;
        }
        
        container.innerHTML = jobs.map(job => `
            <div class="similar-job-item">
                <div class="similar-job-title">
                    <a href="job-details.html?id=${job.id}" class="text-decoration-none">${job.title}</a>
                </div>
                <div class="similar-job-company">${job.company_name}</div>
                <div class="similar-job-meta">
                    <small class="text-muted">${this.formatRemoteType(job.remote_type)} • ${this.formatJobType(job.job_type)}</small>
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Apply button
        document.getElementById('applyBtn').addEventListener('click', () => {
            this.showApplicationModal();
        });

        // Save job button
        document.getElementById('saveJobBtn').addEventListener('click', () => {
            this.toggleSaveJob();
        });

        // Submit application
        document.getElementById('submitApplication').addEventListener('click', () => {
            this.submitApplication();
        });

        // View company profile
        document.getElementById('viewCompanyProfile').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `company-profile.html?id=${this.jobData.company_id}`;
        });
    }

    showApplicationModal() {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
            // Redirect to login
            localStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        // Pre-fill form with user data
        document.getElementById('applicantName').value = user.name || '';
        document.getElementById('applicantEmail').value = user.email || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
        modal.show();
    }

    async submitApplication() {
        const form = document.getElementById('applicationForm');
        const formData = new FormData();
        
        formData.append('job_id', this.jobId);
        formData.append('name', document.getElementById('applicantName').value);
        formData.append('email', document.getElementById('applicantEmail').value);
        formData.append('cover_letter', document.getElementById('coverLetter').value);
        
        const resume = document.getElementById('resumeUpload').files[0];
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('applicationModal'));
                modal.hide();
                
                // Show success message
                this.showAlert('Application submitted successfully!', 'success');
                
                // Update apply button
                document.getElementById('applyBtn').innerHTML = '<i class="fas fa-check me-2"></i>Applied';
                document.getElementById('applyBtn').disabled = true;
                document.getElementById('applyBtn').classList.remove('btn-primary');
                document.getElementById('applyBtn').classList.add('btn-success');
                
            } else {
                this.showAlert(data.message || 'Error submitting application', 'danger');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showAlert('Network error. Please try again.', 'danger');
        }
    }

    async toggleSaveJob() {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('/api/saved-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ job_id: this.jobId })
            });

            const data = await response.json();
            const saveBtn = document.getElementById('saveJobBtn');

            if (response.ok) {
                if (data.action === 'saved') {
                    saveBtn.innerHTML = '<i class="fas fa-bookmark me-1"></i>Saved';
                    saveBtn.classList.remove('btn-outline-primary');
                    saveBtn.classList.add('btn-primary');
                    this.showAlert('Job saved to your favorites!', 'success');
                } else {
                    saveBtn.innerHTML = '<i class="far fa-bookmark me-1"></i>Save';
                    saveBtn.classList.remove('btn-primary');
                    saveBtn.classList.add('btn-outline-primary');
                    this.showAlert('Job removed from favorites', 'info');
                }
            } else {
                this.showAlert(data.message || 'Error saving job', 'danger');
            }
        } catch (error) {
            console.error('Error saving job:', error);
            this.showAlert('Network error. Please try again.', 'danger');
        }
    }

    showError() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
    }

    showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Utility methods
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

    formatSalary(amount) {
        return new Intl.NumberFormat('en-US').format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 14) return '1 week ago';
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 60) return '1 month ago';
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    formatContent(content) {
        if (!content) return '';
        
        // Convert line breaks to HTML
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JobDetails();
});
