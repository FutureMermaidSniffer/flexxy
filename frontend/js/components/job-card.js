// Universal Job Card Component
// Provides consistent job card rendering across all pages

class JobCard {
    constructor(options = {}) {
        this.options = {
            displayMode: 'grid', // 'grid', 'list', 'featured'
            showSaveButton: true,
            showApplyButton: true,
            showViewsCount: false,
            truncateDescription: true,
            ...options
        };
    }

    // Main method to render job card HTML
    render(job) {
        if (!job || !job.id) {
            return this.renderError('Invalid job data');
        }

        const cardClasses = this.getCardClasses(job);
        const jobData = this.processJobData(job);

        return `
            <div class="${cardClasses}" data-job-id="${job.id}" data-job-card="true">
                ${this.renderJobHeader(jobData)}
                ${this.renderJobContent(jobData)}
            </div>
        `;
    }

    // Render multiple job cards
    renderMultiple(jobs, containerSelector) {
        if (!jobs || jobs.length === 0) {
            return this.renderEmptyState();
        }

        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container ${containerSelector} not found`);
            return;
        }

        const jobCardsHTML = jobs.map(job => this.render(job)).join('');
        container.innerHTML = jobCardsHTML;
        
        // Set up event listeners for the job cards
        this.setupEventListeners(container);
    }

    // Set up event listeners for job cards
    setupEventListeners(container) {
        // Main job card click handlers
        const jobCards = container.querySelectorAll('[data-job-card="true"]');
        jobCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const jobId = card.getAttribute('data-job-id');
                if (jobId) {
                    JobCard.navigateToDetails(parseInt(jobId));
                }
            });
        });

        // Save job button handlers
        const saveButtons = container.querySelectorAll('[data-save-btn="true"]');
        saveButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-save-job');
                if (jobId) {
                    JobCard.toggleSaveJob(parseInt(jobId), btn);
                }
            });
        });

        // View details button handlers
        const detailsButtons = container.querySelectorAll('[data-details-btn="true"]');
        detailsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-job-details');
                if (jobId) {
                    JobCard.navigateToDetails(parseInt(jobId));
                }
            });
        });
    }

    // Process job data with defaults and formatting
    processJobData(job) {
        return {
            ...job,
            company_name: job.company_name || 'Company Name Not Available',
            company_logo: job.company_logo || 'images/logo.png',
            location: job.location || 'Location not specified',
            salary_display: this.formatSalary(job),
            time_ago: this.formatTimeAgo(job.created_at),
            description_preview: this.formatDescription(job.description),
            skills: this.formatSkills(job.skills || job.tags),
            badges: this.generateBadges(job)
        };
    }

    // Get CSS classes for job card based on display mode and job properties
    getCardClasses(job) {
        const baseClasses = ['job-card'];
        
        // Display mode classes
        if (this.options.displayMode === 'list') {
            baseClasses.push('job-card-list');
        } else if (this.options.displayMode === 'featured') {
            baseClasses.push('job-card-featured');
        }

        // Job property classes
        if (job.is_featured) {
            baseClasses.push('job-card-featured-job');
        }

        // Interactive classes
        baseClasses.push('job-card-clickable');

        return baseClasses.join(' ');
    }

    // Render job card header with logo and badges
    renderJobHeader(job) {
        return `
            <div class="job-header">
                <div class="company-logo">
                    <img src="${job.company_logo}" 
                         alt="${job.company_name}" 
                         class="company-img" 
                         onerror="this.src='images/logo.png'">
                </div>
                ${job.badges.map(badge => `<div class="job-badge ${badge.type}">${badge.text}</div>`).join('')}
            </div>
        `;
    }

    // Render main job content
    renderJobContent(job) {
        return `
            <div class="job-content">
                <h4 class="job-title">${job.title}</h4>
                <p class="company-name">${job.company_name}</p>
                
                <div class="job-details">
                    ${this.renderJobMetadata(job)}
                </div>
                
                ${this.options.truncateDescription ? `
                    <p class="job-description">${job.description_preview}</p>
                ` : ''}
                
                ${job.skills.length > 0 ? `
                    <div class="job-tags">
                        ${job.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="job-footer">
                    <span class="salary">${job.salary_display}</span>
                    <span class="posted-date">${job.time_ago}</span>
                </div>
                
                ${this.renderJobActions(job)}
            </div>
        `;
    }

    // Render job metadata (location, type, schedule)
    renderJobMetadata(job) {
        const metadata = [];

        if (job.location) {
            metadata.push(`
                <span class="job-location">
                    <i class="fas fa-map-marker-alt me-1"></i>${job.location}
                </span>
            `);
        }

        metadata.push(`
            <span class="job-type">
                <i class="fas fa-${this.getRemoteIcon(job.remote_type)} me-1"></i>${this.formatRemoteType(job.remote_type)}
            </span>
        `);

        metadata.push(`
            <span class="job-schedule">
                <i class="fas fa-clock me-1"></i>${this.formatJobType(job.job_type)}
            </span>
        `);

        return metadata.join('');
    }

    // Render action buttons if enabled
    renderJobActions(job) {
        if (!this.options.showSaveButton && !this.options.showApplyButton && !this.options.showViewsCount) {
            return '';
        }

        return `
            <div class="job-actions mt-3">
                ${this.options.showViewsCount ? `
                    <small class="text-muted">
                        <i class="fas fa-eye me-1"></i>${job.views_count || 0} views
                        <i class="fas fa-paper-plane ms-2 me-1"></i>${job.applications_count || 0} applications
                    </small>
                ` : ''}
                
                <div class="action-buttons">
                    ${this.options.showSaveButton ? `
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                data-save-job="${job.id}" data-save-btn="true">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    ` : ''}
                    
                    ${this.options.showApplyButton ? `
                        <button class="btn btn-sm btn-primary" 
                                data-job-details="${job.id}" data-details-btn="true">
                            View Details
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Generate badges based on job properties
    generateBadges(job) {
        const badges = [];

        if (job.is_featured) {
            badges.push({ type: 'featured', text: 'Featured' });
        }

        // Check if job is new (posted within last 3 days)
        const createdDate = new Date(job.created_at);
        const daysDiff = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 3) {
            badges.push({ type: 'new', text: 'New!' });
        }

        // Add urgent badge for specific job types or if applications are low
        if (job.job_type === 'contract' && (job.applications_count || 0) < 5) {
            badges.push({ type: 'urgent', text: 'Urgent' });
        }

        return badges;
    }

    // Format salary display
    formatSalary(job) {
        if (!job.salary_min && !job.salary_max) {
            return 'Salary not disclosed';
        }

        const currency = job.salary_currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency;
        
        // Handle hourly rates
        if (job.salary_type === 'hourly') {
            if (job.salary_min && job.salary_max) {
                return `${currencySymbol}${this.formatNumber(job.salary_min)} - ${currencySymbol}${this.formatNumber(job.salary_max)}/hr`;
            } else if (job.salary_min) {
                return `From ${currencySymbol}${this.formatNumber(job.salary_min)}/hr`;
            }
        }

        // Handle yearly/monthly salaries
        if (job.salary_min && job.salary_max) {
            return `${currencySymbol}${this.formatSalaryNumber(job.salary_min)} - ${currencySymbol}${this.formatSalaryNumber(job.salary_max)}`;
        } else if (job.salary_min) {
            return `From ${currencySymbol}${this.formatSalaryNumber(job.salary_min)}`;
        } else if (job.salary_max) {
            return `Up to ${currencySymbol}${this.formatSalaryNumber(job.salary_max)}`;
        }

        return 'Competitive salary';
    }

    // Format large salary numbers (e.g., 85000 -> 85k)
    formatSalaryNumber(amount) {
        const num = parseFloat(amount);
        if (num >= 1000) {
            return `${Math.floor(num / 1000)}k`;
        }
        return this.formatNumber(num);
    }

    // Format regular numbers with commas
    formatNumber(amount) {
        return new Intl.NumberFormat('en-US').format(parseFloat(amount));
    }

    // Format time ago display
    formatTimeAgo(dateString) {
        if (!dateString) return 'Recently posted';

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

    // Format job description for preview
    formatDescription(description) {
        if (!description) return 'No description available.';
        
        // Strip HTML tags and limit length
        const plainText = description.replace(/<[^>]*>/g, '');
        if (plainText.length <= 150) return plainText;
        
        return plainText.substring(0, 150) + '...';
    }

    // Format skills/tags array
    formatSkills(skillsData) {
        if (!skillsData) return [];
        
        // Handle different formats: array, comma-separated string, or JSON
        if (Array.isArray(skillsData)) {
            return skillsData.slice(0, 4); // Limit to 4 skills for display
        }
        
        if (typeof skillsData === 'string') {
            // Try to parse as JSON first
            try {
                const parsed = JSON.parse(skillsData);
                if (Array.isArray(parsed)) {
                    return parsed.slice(0, 4);
                }
            } catch (e) {
                // If not JSON, treat as comma-separated
                return skillsData.split(',').map(s => s.trim()).slice(0, 4);
            }
        }
        
        return [];
    }

    // Format job type display
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

    // Format remote type display
    formatRemoteType(type) {
        const types = {
            'remote': 'Remote',
            'hybrid': 'Hybrid',
            'on-site': 'On-site'
        };
        return types[type] || type;
    }

    // Get appropriate icon for remote type
    getRemoteIcon(type) {
        const icons = {
            'remote': 'laptop',
            'hybrid': 'home',
            'on-site': 'building'
        };
        return icons[type] || 'briefcase';
    }

    // Render empty state when no jobs available
    renderEmptyState() {
        return `
            <div class="no-jobs-state text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No Jobs Found</h4>
                <p class="text-muted">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
        `;
    }

    // Render error state
    renderError(message) {
        return `
            <div class="job-card job-card-error">
                <div class="job-content text-center p-3">
                    <i class="fas fa-exclamation-triangle text-warning mb-2"></i>
                    <p class="text-muted mb-0">${message}</p>
                </div>
            </div>
        `;
    }

    // Static method to navigate to job details
    static navigateToDetails(jobId) {
        if (!jobId) {
            console.error('Job ID is required for navigation');
            return;
        }

        // Check if user is authenticated
        if (typeof Auth !== 'undefined' && Auth.isAuthenticated && !Auth.isAuthenticated()) {
            console.log(`🔐 User not authenticated, redirecting to wizard for job ${jobId}`);
            
            // Store the intended job ID for after authentication
            localStorage.setItem('intendedJobId', jobId.toString());
            
            // Redirect to wizard starting page
            window.location.href = 'why-remote.html';
            return;
        }

        // User is authenticated, proceed to job details
        window.location.href = `job-details.html?id=${jobId}`;
    }

    // Static method to toggle save job
    static async toggleSaveJob(jobId, buttonElement) {
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
                body: JSON.stringify({ job_id: jobId })
            });

            const data = await response.json();

            if (response.ok) {
                const icon = buttonElement.querySelector('i');
                if (data.action === 'saved') {
                    icon.className = 'fas fa-bookmark';
                    buttonElement.classList.remove('btn-outline-primary');
                    buttonElement.classList.add('btn-primary');
                } else {
                    icon.className = 'far fa-bookmark';
                    buttonElement.classList.remove('btn-primary');
                    buttonElement.classList.add('btn-outline-primary');
                }
            } else {
                console.error('Error saving job:', data.message);
            }
        } catch (error) {
            console.error('Network error saving job:', error);
        }
    }

    // Static method to create loading state
    static renderLoadingState(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading jobs...</span>
                    </div>
                    <p class="mt-3">Finding the best opportunities for you...</p>
                </div>
            `;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobCard;
}

// Make available globally
window.JobCard = JobCard;
