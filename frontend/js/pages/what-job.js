// What Job Page JavaScript
// Page-specific functionality for the job title selection page

// Page-specific functionality
class WhatJobPage {
    constructor() {
        this.selectedJobs = new Set();
        this.jobSuggestions = [
            'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
            'Marketing Manager', 'Digital Marketing Manager', 'Content Marketing Manager', 'Social Media Manager',
            'Data Analyst', 'Data Scientist', 'Business Analyst', 'Financial Analyst', 'Research Analyst',
            'UX Designer', 'UI Designer', 'Graphic Designer', 'Web Designer', 'Product Designer',
            'Content Writer', 'Technical Writer', 'Copywriter', 'Blog Writer', 'Grant Writer',
            'Project Manager', 'Product Manager', 'Program Manager', 'Operations Manager', 'Account Manager',
            'Customer Success Manager', 'Customer Support Representative', 'Sales Representative', 'Account Executive',
            'Virtual Assistant', 'Executive Assistant', 'Administrative Assistant', 'Personal Assistant',
            'DevOps Engineer', 'QA Engineer', 'Mobile Developer', 'WordPress Developer', 'Python Developer',
            'HR Manager', 'Recruiter', 'Training Specialist', 'Consultant', 'Freelancer'
        ];
        
        this.init();
    }

    init() {
        this.setupJobInput();
        this.setupPopularJobs();
        this.setupSkipButton();
        this.restoreFromLocalStorage();
        
        // Enable next button since job selection is optional
        // Ensure both desktop and mobile buttons are enabled
        this.enableNextButton();
    }

    enableNextButton() {
        setTimeout(() => {
            if (window.wizardFooter) {
                window.wizardFooter.enableNextButton();
            }
        }, 100);
    }

    setupJobInput() {
        const jobInput = document.getElementById('jobTitleInput');
        const suggestionsContainer = document.getElementById('jobSuggestions');
        
        jobInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showJobSuggestions(query);
            } else {
                this.hideJobSuggestions();
            }
        });
        
        jobInput.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.hideJobSuggestions();
            }, 200);
        });
        
        jobInput.addEventListener('focus', () => {
            const query = jobInput.value.trim();
            if (query.length >= 2) {
                this.showJobSuggestions(query);
            }
        });
        
        // Handle Enter key and comma separation
        jobInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const query = jobInput.value.replace(/,$/, '').trim();
                if (query) {
                    this.addJobTitle(query);
                    jobInput.value = '';
                    this.hideJobSuggestions();
                }
            }
        });
    }

    showJobSuggestions(query) {
        const suggestionsContainer = document.getElementById('jobSuggestions');
        const filteredSuggestions = this.jobSuggestions
            .filter(job => 
                job.toLowerCase().includes(query.toLowerCase()) && 
                !this.selectedJobs.has(job)
            )
            .slice(0, 6);
        
        if (filteredSuggestions.length > 0) {
            const suggestionsHTML = filteredSuggestions.map(job => `
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        onclick="window.whatJobPageInstance.addJobTitle('${job}')">
                    <i class="fas fa-briefcase me-2 text-muted"></i>
                    ${job}
                </button>
            `).join('');
            
            suggestionsContainer.innerHTML = `
                <div class="list-group mt-2 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    ${suggestionsHTML}
                </div>
            `;
            suggestionsContainer.classList.remove('d-none');
        } else {
            this.hideJobSuggestions();
        }
    }

    hideJobSuggestions() {
        const suggestionsContainer = document.getElementById('jobSuggestions');
        suggestionsContainer.classList.add('d-none');
    }

    addJobTitle(jobTitle) {
        if (jobTitle && !this.selectedJobs.has(jobTitle)) {
            this.selectedJobs.add(jobTitle);
            this.updateSelectedDisplay();
            this.updateButtonStates();
            this.storeJobPreference();
            this.trackJobSelection(jobTitle);
            
            // Clear input if adding from input field
            const jobInput = document.getElementById('jobTitleInput');
            if (document.activeElement === jobInput) {
                jobInput.value = '';
                this.hideJobSuggestions();
            }
        }
    }

    removeJobTitle(jobTitle) {
        this.selectedJobs.delete(jobTitle);
        this.updateSelectedDisplay();
        this.updateButtonStates();
        this.storeJobPreference();
    }

    setupPopularJobs() {
        const popularBtns = document.querySelectorAll('.page-job__popular-btn');
        
        popularBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const jobTitle = btn.getAttribute('data-job');
                const icon = btn.querySelector('.page-job__btn-icon');
                
                if (this.selectedJobs.has(jobTitle)) {
                    // Remove job title
                    this.removeJobTitle(jobTitle);
                    
                    // Change back to plus icon and remove selected styling
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-plus');
                    btn.classList.remove('selected');
                } else {
                    // Add job title
                    this.addJobTitle(jobTitle);
                    
                    // Change to check icon and add selected styling
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-check');
                    btn.classList.add('selected');
                }
            });
        });
    }

    setupSkipButton() {
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipJobSelection();
            });
        }
    }

    updateSelectedDisplay() {
        // Only update button states, no display area needed
        // Always keep next button enabled (job selection is optional)
        this.enableNextButton();
    }

    skipJobSelection() {
        // Clear any selected jobs
        this.selectedJobs.clear();
        this.updateSelectedDisplay();
        
        // Track skip action
        this.trackSkipAction();
        
        // Go to next step
        this.goNext();
    }

    goBack() {
        // Add loading animation
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            const originalText = backBtn.innerHTML;
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            backBtn.disabled = true;
        }
        
        // Navigate back to where-remote page
        setTimeout(() => {
            window.location.href = 'where-remote.html';
        }, 300);
    }

    goNext() {
        // Capture any text in the input field before proceeding
        const jobInput = document.getElementById('jobTitleInput');
        if (jobInput && jobInput.value.trim()) {
            const inputValue = jobInput.value.trim();
            this.addJobTitle(inputValue);
        }
        
        // Store job preference
        this.storeJobPreference();
        
        // Add loading animation
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            nextBtn.disabled = true;
        }
        
        // Navigate to next step (relevant experience page)
        setTimeout(() => {
            window.location.href = 'relevant-experience.html';
        }, 500);
    }

    storeJobPreference() {
        const preference = {
            jobTitles: Array.from(this.selectedJobs),
            timestamp: Date.now()
        };
        
        localStorage.setItem('jobTitlePreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('jobTitlePreference');
        if (stored) {
            try {
                const preference = JSON.parse(stored);
                
                if (preference.jobTitles && Array.isArray(preference.jobTitles)) {
                    preference.jobTitles.forEach(job => {
                        this.selectedJobs.add(job);
                    });
                    
                    this.updateSelectedDisplay();
                    this.updateButtonStates();
                }
            } catch (e) {
                console.error('Error restoring job preference:', e);
            }
        }
    }

    updateButtonStates() {
        const popularBtns = document.querySelectorAll('.page-job__popular-btn');
        
        popularBtns.forEach(btn => {
            const jobTitle = btn.getAttribute('data-job');
            const icon = btn.querySelector('.page-job__btn-icon');
            
            if (this.selectedJobs.has(jobTitle)) {
                // Change to check icon and add selected styling
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-check');
                btn.classList.add('selected');
            } else {
                // Change to plus icon and remove selected styling
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.classList.remove('selected');
            }
        });
    }

    trackJobSelection(jobTitle) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'job_title_selected', {
                job_title: jobTitle,
                total_selected: this.selectedJobs.size,
                page: 'what-job'
            });
        }

        console.log('Job title selected:', jobTitle);
    }

    trackSkipAction() {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'job_selection_skipped', {
                page: 'what-job'
            });
        }

        console.log('Job selection skipped');
    }

    // Public methods for external access
    getJobPreference() {
        return {
            jobTitles: Array.from(this.selectedJobs)
        };
    }

    setJobPreference(jobTitles = []) {
        this.selectedJobs = new Set(jobTitles);
        this.updateSelectedDisplay();
    }

    // Wizard footer navigation handlers
    handleNext() {
        this.goNext();
    }

    handleBack() {
        this.goBack();
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard header (step 4 - show back button)
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    // Initialize wizard footer
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(4, 6, 'Next');
        
        // Override navigation handlers for both desktop and mobile
        window.wizardFooter.handleNext = () => {
            if (window.whatJobPageInstance) {
                window.whatJobPageInstance.handleNext();
            }
        };
        
        window.wizardFooter.handleBack = () => {
            if (window.whatJobPageInstance) {
                window.whatJobPageInstance.handleBack();
            }
        };
        
        // Enable next button since job selection is optional
        setTimeout(() => {
            window.wizardFooter.enableNextButton();
        }, 200);
    }
    
    // Initialize page functionality
    window.whatJobPageInstance = new WhatJobPage();
});

// Load header and footer components
if (typeof loadComponents === 'function') {
    loadComponents();
}

// Set active navigation when components are loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        window.headerInstance.setActiveNav('remote-jobs');
    }
});

// Export for external access
window.WhatJobPage = WhatJobPage;
