
class Jobs {
    constructor() {
        this.currentPage = 1;
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.loadJobs();
        this.loadCategories();
    }

    async loadJobs(page = 1, filters = {}) {
        this.currentPage = page;
        this.currentFilters = filters;
        
        const jobListings = document.getElementById('jobListings');
        if (!jobListings) return;

        
        jobListings.innerHTML = this.getLoadingHTML();

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...filters
            });

            const response = await fetch(`/api/jobs?${queryParams}`);
            const data = await response.json();

            if (response.ok) {
                this.renderJobs(data.jobs);
                this.renderPagination(data.pagination);
            } else {
                jobListings.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger">
                            Error loading jobs: ${data.message}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            jobListings.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Network error. Please try again later.
                    </div>
                </div>
            `;
        }
    }

    renderJobs(jobs) {
        const jobListings = document.getElementById('jobListings');
        
        if (jobs.length === 0) {
            jobListings.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4>No jobs found</h4>
                        <p class="text-muted">Try adjusting your search criteria</p>
                    </div>
                </div>
            `;
            return;
        }

        jobListings.innerHTML = jobs.map(job => this.createJobCard(job)).join('');
    }

    createJobCard(job) {
        const salaryRange = job.salary_min && job.salary_max 
            ? `$${this.formatNumber(job.salary_min)} - $${this.formatNumber(job.salary_max)}`
            : job.salary_min 
                ? `From $${this.formatNumber(job.salary_min)}`
                : job.salary_max 
                    ? `Up to $${this.formatNumber(job.salary_max)}`
                    : 'Salary not specified';

        const timeAgo = this.getTimeAgo(new Date(job.created_at));
        
        return `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card job-card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="company-logo me-3">
                                ${job.company_logo 
                                    ? `<img src="${job.company_logo}" alt="${job.company_name}">`
                                    : `<i class="fas fa-building"></i>`
                                }
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1">
                                    <a href="#" onclick="jobs.showJobDetail(${job.id})" class="text-decoration-none">
                                        ${job.title}
                                    </a>
                                </h6>
                                <p class="text-muted mb-0">${job.company_name}</p>
                                ${job.company_location ? `<small class="text-muted">${job.company_location}</small>` : ''}
                            </div>
                            ${job.is_featured ? '<span class="badge bg-warning">Featured</span>' : ''}
                        </div>
                        
                        <div class="job-meta mb-3">
                            <div class="d-flex flex-wrap gap-2 mb-2">
                                <span class="badge ${this.getRemoteTypeBadgeClass(job.remote_type)}">
                                    ${this.formatRemoteType(job.remote_type)}
                                </span>
                                <span class="badge ${this.getJobTypeBadgeClass(job.job_type)}">
                                    ${this.formatJobType(job.job_type)}
                                </span>
                                <span class="badge bg-secondary">
                                    ${this.formatExperienceLevel(job.experience_level)}
                                </span>
                            </div>
                            ${job.location ? `<div class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${job.location}</div>` : ''}
                        </div>
                        
                        <p class="card-text text-truncate-2 mb-3">
                            ${this.stripHTML(job.description)}
                        </p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="job-salary text-success fw-bold">
                                    ${salaryRange}
                                </div>
                                <small class="text-muted">${timeAgo}</small>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <small class="text-muted">
                                    <i class="fas fa-eye me-1"></i>${job.views_count} views
                                    <i class="fas fa-paper-plane ms-2 me-1"></i>${job.applications_count} applications
                                </small>
                                <div>
                                    ${auth.isJobSeeker() ? `
                                        <button class="btn btn-sm btn-outline-danger me-2" onclick="jobs.toggleSaveJob(${job.id}, this)">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-primary" onclick="jobs.showJobDetail(${job.id})">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showJobDetail(jobId) {
        
        window.location.href = `job-details.html?id=${jobId}`;
    }

    renderJobDetail(job) {
        const modalTitle = document.getElementById('jobDetailTitle');
        const modalBody = document.getElementById('jobDetailBody');

        modalTitle.textContent = job.title;

        const salaryRange = job.salary_min && job.salary_max 
            ? `$${this.formatNumber(job.salary_min)} - $${this.formatNumber(job.salary_max)} ${job.salary_currency}`
            : job.salary_min 
                ? `From $${this.formatNumber(job.salary_min)} ${job.salary_currency}`
                : job.salary_max 
                    ? `Up to $${this.formatNumber(job.salary_max)} ${job.salary_currency}`
                    : 'Salary not specified';

        modalBody.innerHTML = `
            <div class="job-detail-header">
                <div class="d-flex align-items-start mb-3">
                    <div class="company-logo-large me-3">
                        ${job.company_logo 
                            ? `<img src="${job.company_logo}" alt="${job.company_name}" class="w-100 h-100 object-fit-cover">`
                            : `<i class="fas fa-building fa-2x"></i>`
                        }
                    </div>
                    <div class="flex-grow-1">
                        <h4 class="mb-1">${job.title}</h4>
                        <h6 class="text-primary mb-1">${job.company_name}</h6>
                        ${job.company_location ? `<p class="text-muted mb-0"><i class="fas fa-map-marker-alt me-1"></i>${job.company_location}</p>` : ''}
                    </div>
                </div>
            </div>

            <div class="job-detail-meta">
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <strong>Job Type:</strong><br>
                        <span class="badge ${this.getJobTypeBadgeClass(job.job_type)} me-1">
                            ${this.formatJobType(job.job_type)}
                        </span>
                        <span class="badge ${this.getRemoteTypeBadgeClass(job.remote_type)}">
                            ${this.formatRemoteType(job.remote_type)}
                        </span>
                    </div>
                    <div class="col-md-6">
                        <strong>Experience Level:</strong><br>
                        <span class="badge bg-secondary">${this.formatExperienceLevel(job.experience_level)}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Salary:</strong><br>
                        <span class="text-success fw-bold">${salaryRange}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Location:</strong><br>
                        <span>${job.location || 'Not specified'}</span>
                    </div>
                    ${job.category_name ? `
                    <div class="col-md-6">
                        <strong>Category:</strong><br>
                        <span><i class="${job.category_icon || 'fas fa-tag'} me-1"></i>${job.category_name}</span>
                    </div>
                    ` : ''}
                    <div class="col-md-6">
                        <strong>Posted:</strong><br>
                        <span>${this.getTimeAgo(new Date(job.created_at))}</span>
                    </div>
                </div>
            </div>

            <div class="job-description mb-4">
                <h6>Job Description</h6>
                <div>${job.description}</div>
            </div>

            ${job.responsibilities ? `
            <div class="job-responsibilities mb-4">
                <h6>Responsibilities</h6>
                <div>${job.responsibilities}</div>
            </div>
            ` : ''}

            ${job.requirements ? `
            <div class="job-requirements mb-4">
                <h6>Requirements</h6>
                <div>${job.requirements}</div>
            </div>
            ` : ''}

            ${job.skills && job.skills.length > 0 ? `
            <div class="job-skills mb-4">
                <h6>Skills</h6>
                <div>
                    ${job.skills.map(skill => `
                        <span class="skill-tag ${skill.is_required ? 'required' : ''}">
                            ${skill.skill_name}
                            ${skill.is_required ? ' (Required)' : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${job.benefits ? `
            <div class="job-benefits mb-4">
                <h6>Benefits</h6>
                <div>${job.benefits}</div>
            </div>
            ` : ''}

            <div class="job-company-info mb-4">
                <h6>About ${job.company_name}</h6>
                <div>${job.company_description || 'No company description available.'}</div>
                ${job.company_website ? `
                <p class="mt-2">
                    <strong>Website:</strong> 
                    <a href="${job.company_website}" target="_blank" rel="noopener">${job.company_website}</a>
                </p>
                ` : ''}
                ${job.company_industry ? `<p><strong>Industry:</strong> ${job.company_industry}</p>` : ''}
                ${job.company_size ? `<p><strong>Company Size:</strong> ${job.company_size} employees</p>` : ''}
            </div>

            ${auth.isJobSeeker() ? `
            <div class="job-actions text-center">
                <button class="btn btn-outline-danger me-2" onclick="jobs.toggleSaveJob(${job.id}, this)">
                    <i class="fas fa-heart me-1"></i>Save Job
                </button>
                <button class="btn btn-primary btn-lg" onclick="jobs.applyForJob(${job.id})">
                    <i class="fas fa-paper-plane me-1"></i>Apply Now
                </button>
            </div>
            ` : auth.isEmployer() ? `
            <div class="job-actions text-center">
                <small class="text-muted">
                    <i class="fas fa-eye me-1"></i>${job.views_count} views
                    <i class="fas fa-paper-plane ms-3 me-1"></i>${job.applications_count} applications
                </small>
            </div>
            ` : ''}
        `;
    }

    async toggleSaveJob(jobId, button) {
        if (!auth.isAuthenticated()) {
            auth.showAlert('Please login to save jobs', 'warning');
            return;
        }

        const icon = button.querySelector('i');
        const isCurrentlySaved = icon.classList.contains('fas');

        try {
            let response;
            if (isCurrentlySaved) {
                
                response = await fetch(`/api/applications/save-job/${jobId}`, {
                    method: 'DELETE',
                    headers: auth.getAuthHeaders()
                });
            } else {
                
                response = await fetch('/api/applications/save-job', {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                    body: JSON.stringify({ job_id: jobId })
                });
            }

            const data = await response.json();

            if (response.ok) {
                
                if (isCurrentlySaved) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    auth.showAlert('Job removed from saved jobs', 'info');
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    auth.showAlert('Job saved successfully', 'success');
                }
            } else {
                auth.showAlert(data.message || 'Error saving job', 'danger');
            }
        } catch (error) {
            console.error('Error toggling save job:', error);
            auth.showAlert('Network error. Please try again.', 'danger');
        }
    }

    async applyForJob(jobId) {
        if (!auth.isAuthenticated()) {
            auth.showAlert('Please login to apply for jobs', 'warning');
            return;
        }

        if (!auth.isJobSeeker()) {
            auth.showAlert('Only job seekers can apply for jobs', 'warning');
            return;
        }

        
        const coverLetter = prompt('Enter a cover letter (optional):');

        try {
            const response = await fetch('/api/applications/apply', {
                method: 'POST',
                headers: auth.getAuthHeaders(),
                body: JSON.stringify({
                    job_id: jobId,
                    cover_letter: coverLetter || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                auth.showAlert('Application submitted successfully!', 'success');
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('jobDetailModal'));
                modal.hide();
            } else {
                auth.showAlert(data.message || 'Error submitting application', 'danger');
            }
        } catch (error) {
            console.error('Error applying for job:', error);
            auth.showAlert('Network error. Please try again.', 'danger');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/jobs/categories/list');
            const data = await response.json();

            if (response.ok) {
                
                this.categories = data.categories;
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderPagination(pagination) {
        const paginationContainer = document.getElementById('jobPagination');
        if (!paginationContainer) return;

        if (pagination.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<ul class="pagination">';

        
        if (pagination.hasPrev) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="jobs.loadJobs(${pagination.page - 1}, jobs.currentFilters)">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        
        const startPage = Math.max(1, pagination.page - 2);
        const endPage = Math.min(pagination.totalPages, pagination.page + 2);

        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="jobs.loadJobs(1, jobs.currentFilters)">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="jobs.loadJobs(${i}, jobs.currentFilters)">${i}</a>
                </li>
            `;
        }

        if (endPage < pagination.totalPages) {
            if (endPage < pagination.totalPages - 1) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="jobs.loadJobs(${pagination.totalPages}, jobs.currentFilters)">${pagination.totalPages}</a>
                </li>
            `;
        }

        
        if (pagination.hasNext) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="jobs.loadJobs(${pagination.page + 1}, jobs.currentFilters)">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;
    }

    
    getLoadingHTML() {
        return `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Loading jobs...</p>
            </div>
        `;
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
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
            'remote': '100% Remote',
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

    getJobTypeBadgeClass(type) {
        const classes = {
            'full-time': 'badge-full-time',
            'part-time': 'badge-part-time',
            'contract': 'badge-contract',
            'freelance': 'badge-freelance',
            'internship': 'badge-internship'
        };
        return `bg-primary ${classes[type] || ''}`;
    }

    getRemoteTypeBadgeClass(type) {
        const classes = {
            'remote': 'badge-remote',
            'hybrid': 'badge-hybrid',
            'on-site': 'badge-onsite'
        };
        return `bg-success ${classes[type] || ''}`;
    }

    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    }
}


function searchJobs() {
    const filters = {
        search: document.getElementById('searchKeyword').value,
        job_type: document.getElementById('jobType').value,
        remote_type: document.getElementById('remoteType').value,
        experience_level: document.getElementById('experienceLevel').value,
        location: document.getElementById('location').value
    };

    
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });

    jobs.loadJobs(1, filters);
}


let jobs;
document.addEventListener('DOMContentLoaded', () => {
    jobs = new Jobs();
});
