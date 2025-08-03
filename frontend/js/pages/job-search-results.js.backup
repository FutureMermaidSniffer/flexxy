// Job Search Results Page JavaScript
// Handles job search, filtering, and results display

class JobSearchResultsPage {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.currentPage = 1;
        this.jobsPerPage = 10;
        this.isLoading = false;
        this.userPreferences = {};
        
        this.init();
    }

    init() {
        // Load user preferences
        this.loadUserPreferences();
        
        // Setup search functionality
        this.setupSearch();
        
        // Setup filters
        this.setupFilters();
        
        // Setup sorting
        this.setupSorting();
        
        // Load initial jobs
        this.loadJobs();
        
        console.log('Job search results page initialized');
    }

    loadUserPreferences() {
        try {
            // Get user data from registration
            const userData = localStorage.getItem('flexjobs_user_data');
            if (userData) {
                const parsed = JSON.parse(userData);
                this.userPreferences = parsed.preferences || {};
            }
            
            console.log('User preferences loaded:', this.userPreferences);
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('jobSearchInput');
        const searchBtn = document.getElementById('searchBtn');
        const locationSelect = document.getElementById('locationSelect');
        
        // Set initial search based on user preferences
        if (this.userPreferences.jobTitles && this.userPreferences.jobTitles.jobTitles) {
            const jobTitles = this.userPreferences.jobTitles.jobTitles;
            if (jobTitles.length > 0) {
                searchInput.value = jobTitles[0]; // Use first selected job title
            }
        }
        
        // Search functionality
        const performSearch = () => {
            const query = searchInput.value.trim();
            const location = locationSelect.value;
            this.searchJobs(query, location);
        };
        
        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        locationSelect.addEventListener('change', performSearch);
    }

    setupFilters() {
        // Filter pills
        const filterPills = document.querySelectorAll('.filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Remove active from all pills
                filterPills.forEach(p => p.classList.remove('active'));
                // Add active to clicked pill
                pill.classList.add('active');
                
                const filter = pill.getAttribute('data-filter');
                this.filterJobs(filter);
            });
        });
        
        // Sidebar filters
        const filterCheckboxes = document.querySelectorAll('.filter-option input');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    setupSorting() {
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', () => {
            const sortBy = sortSelect.value;
            this.sortJobs(sortBy);
        });
    }

    async loadJobs() {
        this.showLoading();
        
        try {
            // Simulate API call to load jobs
            const jobs = await this.fetchJobs();
            this.jobs = jobs;
            this.filteredJobs = [...jobs];
            
            this.hideLoading();
            this.renderJobs();
            this.updateResultsCount();
            
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.hideLoading();
            this.showError('Failed to load jobs. Please try again.');
        }
    }

    async fetchJobs() {
        // Fetch real jobs from API
        try {
            const response = await fetch('/api/jobs?limit=50&is_active=true', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Real jobs data received:', data);

            // Transform API response to match expected format
            return data.jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company_name,
                location: job.location || 'Remote',
                salary: this.formatSalary(job.salary_min, job.salary_max, job.salary_currency),
                type: this.formatJobType(job.job_type),
                experience: this.formatExperienceLevel(job.experience_level),
                description: job.description.substring(0, 200) + '...',
                tags: this.extractTags(job),
                postedDate: this.formatDate(job.created_at),
                isRemote: job.remote_type === 'remote',
                isSaved: false,
                // Keep original data for job details navigation
                originalJob: job
            }));

        } catch (error) {
            console.error('❌ Error fetching real jobs:', error);
            // Fallback to mock data if API fails
            console.log('🔄 Falling back to mock data');
            return this.generateMockJobs();
        }
    }

    // Helper methods for data transformation
    formatSalary(min, max, currency = 'USD') {
        if (!min && !max) return 'Competitive';
        if (!max) return `$${parseInt(min).toLocaleString()}+`;
        if (!min) return `Up to $${parseInt(max).toLocaleString()}`;
        return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
    }

    formatJobType(jobType) {
        const typeMap = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'freelance': 'Freelance',
            'internship': 'Internship'
        };
        return typeMap[jobType] || jobType;
    }

    formatExperienceLevel(level) {
        const levelMap = {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level',
            'executive': 'Executive Level'
        };
        return levelMap[level] || level;
    }

    extractTags(job) {
        const tags = [];
        
        // Add job type and remote type
        if (job.remote_type === 'remote') tags.push('Remote');
        if (job.remote_type === 'hybrid') tags.push('Hybrid');
        if (job.job_type === 'full-time') tags.push('Full-time');
        
        // Add category
        if (job.category_name) tags.push(job.category_name);
        
        // Add experience level
        if (job.experience_level) tags.push(this.formatExperienceLevel(job.experience_level));
        
        // Parse tags from job.tags field if available
        if (job.tags && typeof job.tags === 'string') {
            const jobTags = job.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tags.push(...jobTags);
        }
        
        return tags.slice(0, 6); // Limit to 6 tags
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    }

    generateMockJobs() {
        const jobTitles = [
            'Senior Software Engineer', 'Frontend Developer', 'UX Designer', 'Data Analyst',
            'Marketing Manager', 'Content Writer', 'Project Manager', 'Customer Success Manager',
            'DevOps Engineer', 'Product Manager', 'Graphic Designer', 'Virtual Assistant',
            'Sales Representative', 'Business Analyst', 'Technical Writer', 'Social Media Manager'
        ];
        
        const companies = [
            'TechCorp Inc.', 'Digital Solutions LLC', 'InnovateCo', 'FlexWork Studios',
            'RemoteFirst Ltd.', 'CloudTech Systems', 'DataDriven Co.', 'CreativeAgency',
            'StartupHub', 'Enterprise Solutions', 'ModernWork Inc.', 'FutureDigital'
        ];
        
        const locations = ['Remote', 'Remote - US', 'Remote - Global', 'Hybrid - CA', 'Hybrid - NY'];
        const salaryRanges = ['$45,000 - $65,000', '$65,000 - $85,000', '$85,000 - $120,000', '$120,000 - $150,000'];
        const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
        const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level'];
        
        const jobs = [];
        
        for (let i = 0; i < 50; i++) {
            const job = {
                id: i + 1,
                title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                salary: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
                type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
                experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
                description: this.generateJobDescription(),
                tags: this.generateJobTags(),
                postedDate: this.generatePostedDate(),
                isRemote: Math.random() > 0.3,
                isSaved: false
            };
            jobs.push(job);
        }
        
        return jobs;
    }

    generateJobDescription() {
        const descriptions = [
            "Join our dynamic team and work on cutting-edge projects that make a real impact. We offer competitive compensation, excellent benefits, and a collaborative remote work environment.",
            "We're looking for a passionate professional to help drive our company's growth. This role offers great opportunities for career advancement and skill development.",
            "Be part of an innovative company that values work-life balance and professional growth. We provide comprehensive benefits and flexible working arrangements.",
            "Exciting opportunity to work with industry-leading clients and technologies. Join our team of experts and contribute to meaningful projects.",
            "Help us build the future of digital solutions. We offer a supportive environment, competitive pay, and opportunities to work on diverse projects."
        ];
        
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    generateJobTags() {
        const allTags = [
            'JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Remote', 'Flexible Hours',
            'Health Insurance', 'Marketing', 'SEO', 'Content Creation', 'Project Management',
            'Data Analysis', 'UI/UX', 'Figma', 'Photoshop', 'Customer Service', 'Sales'
        ];
        
        const numTags = Math.floor(Math.random() * 5) + 2;
        const shuffled = allTags.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numTags);
    }

    generatePostedDate() {
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        if (daysAgo === 0) return 'Today';
        if (daysAgo === 1) return 'Yesterday';
        if (daysAgo < 7) return `${daysAgo} days ago`;
        if (daysAgo < 14) return '1 week ago';
        if (daysAgo < 21) return '2 weeks ago';
        return '3+ weeks ago';
    }

    searchJobs(query, location) {
        let filtered = [...this.jobs];
        
        if (query) {
            filtered = filtered.filter(job => 
                job.title.toLowerCase().includes(query.toLowerCase()) ||
                job.company.toLowerCase().includes(query.toLowerCase()) ||
                job.description.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (location && location !== '') {
            filtered = filtered.filter(job => 
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        
        this.filteredJobs = filtered;
        this.currentPage = 1;
        this.renderJobs();
        this.updateResultsCount();
    }

    filterJobs(filterType) {
        let filtered = [...this.jobs];
        
        switch (filterType) {
            case 'remote':
                filtered = filtered.filter(job => job.location.includes('Remote'));
                break;
            case 'hybrid':
                filtered = filtered.filter(job => job.location.includes('Hybrid'));
                break;
            case 'flexible':
                filtered = filtered.filter(job => job.type === 'Part-time' || job.type === 'Freelance');
                break;
            default:
                // 'all' - no filtering
                break;
        }
        
        this.filteredJobs = filtered;
        this.currentPage = 1;
        this.renderJobs();
        this.updateResultsCount();
    }

    applyFilters() {
        const jobTypeFilters = Array.from(document.querySelectorAll('.filter-group:nth-child(1) input:checked')).map(cb => cb.value);
        const experienceFilters = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input:checked')).map(cb => cb.value);
        const salaryFilters = Array.from(document.querySelectorAll('.filter-group:nth-child(3) input:checked')).map(cb => cb.value);
        
        let filtered = [...this.jobs];
        
        if (jobTypeFilters.length > 0) {
            filtered = filtered.filter(job => 
                jobTypeFilters.some(filter => job.type.toLowerCase().includes(filter))
            );
        }
        
        if (experienceFilters.length > 0) {
            filtered = filtered.filter(job => 
                experienceFilters.some(filter => {
                    if (filter === 'entry') return job.experience === 'Entry Level';
                    if (filter === 'mid') return job.experience === 'Mid Level';
                    if (filter === 'senior') return job.experience === 'Senior Level';
                    if (filter === 'executive') return job.experience === 'Executive';
                    return false;
                })
            );
        }
        
        this.filteredJobs = filtered;
        this.currentPage = 1;
        this.renderJobs();
        this.updateResultsCount();
    }

    sortJobs(sortBy) {
        let sorted = [...this.filteredJobs];
        
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => b.id - a.id);
                break;
            case 'salary-high':
                sorted.sort((a, b) => this.extractSalary(b.salary) - this.extractSalary(a.salary));
                break;
            case 'salary-low':
                sorted.sort((a, b) => this.extractSalary(a.salary) - this.extractSalary(b.salary));
                break;
            case 'company':
                sorted.sort((a, b) => a.company.localeCompare(b.company));
                break;
            default:
                // 'relevance' - keep current order
                break;
        }
        
        this.filteredJobs = sorted;
        this.renderJobs();
    }

    extractSalary(salaryString) {
        // Extract numeric value from salary string for sorting
        const numbers = salaryString.match(/\d+/g);
        return numbers ? parseInt(numbers[numbers.length - 1]) : 0;
    }

    renderJobs() {
        const jobListings = document.getElementById('jobListings');
        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        const jobsToShow = this.filteredJobs.slice(0, endIndex);
        
        if (jobsToShow.length === 0) {
            jobListings.innerHTML = `
                <div class="no-results text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3>No jobs found</h3>
                    <p class="text-muted">Try adjusting your search criteria or filters.</p>
                </div>
            `;
            document.getElementById('loadMoreContainer').style.display = 'none';
            return;
        }
        
        const jobsHTML = jobsToShow.map(job => this.createJobCard(job)).join('');
        jobListings.innerHTML = jobsHTML;
        
        // Show/hide load more button
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (endIndex < this.filteredJobs.length) {
            loadMoreContainer.style.display = 'block';
            this.setupLoadMore();
        } else {
            loadMoreContainer.style.display = 'none';
        }
        
        jobListings.style.display = 'block';
    }

    createJobCard(job) {
        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="job-salary">${job.salary}</div>
                </div>
                
                <div class="job-meta">
                    <div class="job-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${job.location}</span>
                    </div>
                    <div class="job-meta-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${job.type}</span>
                    </div>
                    <div class="job-meta-item">
                        <i class="fas fa-chart-line"></i>
                        <span>${job.experience}</span>
                    </div>
                </div>
                
                <div class="job-description">
                    ${job.description}
                </div>
                
                <div class="job-tags">
                    ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
                </div>
                
                <div class="job-actions">
                    <div class="job-posted">${job.postedDate}</div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="save-job-btn ${job.isSaved ? 'saved' : ''}" data-job-id="${job.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="job-apply-btn" data-job-id="${job.id}">
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.replaceWith(loadMoreBtn.cloneNode(true)); // Remove existing listeners
        
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.currentPage++;
            this.renderJobs();
        });
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('jobListings').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        resultsCount.textContent = this.filteredJobs.length.toLocaleString();
    }

    showError(message) {
        const jobListings = document.getElementById('jobListings');
        jobListings.innerHTML = `
            <div class="error-state text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Something went wrong</h3>
                <p class="text-muted">${message}</p>
                <button class="btn btn-primary" id="retry-job-search-btn">
                    Try Again
                </button>
            </div>
        `;
        jobListings.style.display = 'block';
        
        // Add event listener for retry button
        setTimeout(() => {
            const retryBtn = document.getElementById('retry-job-search-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.loadJobs());
            }
        }, 100);
    }

    // Event handlers
    handleJobClick(jobId) {
        console.log('Job clicked:', jobId);
        // Navigate to job details page
        window.location.href = `job-details.html?id=${jobId}`;
    }

    handleSaveJob(jobId) {
        const job = this.jobs.find(j => j.id === parseInt(jobId));
        if (job) {
            job.isSaved = !job.isSaved;
            this.renderJobs();
            
            // Save to localStorage
            this.saveUserActivity('job_saved', jobId);
        }
    }

    handleApplyJob(jobId) {
        console.log('Apply to job:', jobId);
        this.saveUserActivity('job_applied', jobId);
        // Navigate to application page or open modal
    }

    saveUserActivity(action, jobId) {
        try {
            const activity = {
                action,
                jobId,
                timestamp: Date.now()
            };
            
            const activities = JSON.parse(localStorage.getItem('flexjobs_activities') || '[]');
            activities.push(activity);
            localStorage.setItem('flexjobs_activities', JSON.stringify(activities));
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobSearchResultsPage = new JobSearchResultsPage();
    
    // Setup event delegation for job cards
    document.addEventListener('click', (e) => {
        const jobCard = e.target.closest('.job-card');
        const saveBtn = e.target.closest('.save-job-btn');
        const applyBtn = e.target.closest('.job-apply-btn');
        
        if (saveBtn) {
            e.stopPropagation();
            const jobId = saveBtn.getAttribute('data-job-id');
            window.jobSearchResultsPage.handleSaveJob(jobId);
        } else if (applyBtn) {
            e.stopPropagation();
            const jobId = applyBtn.getAttribute('data-job-id');
            window.jobSearchResultsPage.handleApplyJob(jobId);
        } else if (jobCard) {
            const jobId = jobCard.getAttribute('data-job-id');
            window.jobSearchResultsPage.handleJobClick(jobId);
        }
    });
});

// Load header and footer components
if (typeof loadComponents === 'function') {
    loadComponents();
}

// Export for external access
window.JobSearchResultsPage = JobSearchResultsPage;
