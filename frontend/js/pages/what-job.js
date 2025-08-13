



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
        
        // Always enable next button so users can proceed with or without selections
        this.enableNextButton();
        
        // Update display to show any restored selections
        this.updateSelectedDisplay();
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
            
            // Enable proceeding with custom input
            this.updateCustomInputState(query);
        });
        
        jobInput.addEventListener('blur', () => {
            // Delay hiding suggestions to allow for clicks
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
        
        // Handle Enter key and comma for adding custom job titles
        jobInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const query = jobInput.value.replace(/,$/, '').trim();
                if (query) {
                    this.addJobTitle(query);
                    jobInput.value = '';
                    this.hideJobSuggestions();
                    this.updateCustomInputState('');
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
        
        let suggestionsHTML = '';
        
        if (filteredSuggestions.length > 0) {
            suggestionsHTML = filteredSuggestions.map(job => `
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        data-job-title="${job}">
                    <i class="fas fa-briefcase me-2 text-muted"></i>
                    ${job}
                </button>
            `).join('');
        }
        
        // Always add option to use custom input
        const customOption = `
            <button class="list-group-item list-group-item-action d-flex align-items-center border-top custom-job-option" 
                    data-custom-job="${query}">
                <i class="fas fa-plus me-2 text-primary"></i>
                <span class="text-primary fw-medium">Use "${query}"</span>
            </button>
        `;
        
        if (filteredSuggestions.length > 0) {
            suggestionsHTML += customOption;
        } else {
            suggestionsHTML = customOption;
        }
        
        suggestionsContainer.innerHTML = `
            <div class="list-group mt-2 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                ${suggestionsHTML}
            </div>
        `;
        
        // Bind events for suggestion buttons
        const suggestionButtons = suggestionsContainer.querySelectorAll('[data-job-title]');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const jobTitle = button.getAttribute('data-job-title');
                this.addJobTitle(jobTitle);
            });
        });
        
        // Bind event for custom job option
        const customButton = suggestionsContainer.querySelector('[data-custom-job]');
        if (customButton) {
            customButton.addEventListener('click', (e) => {
                e.preventDefault();
                const customJob = customButton.getAttribute('data-custom-job');
                this.addJobTitle(customJob);
            });
        }
        
        suggestionsContainer.classList.remove('d-none');
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
                    
                    this.removeJobTitle(jobTitle);
                    
                    
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-plus');
                    btn.classList.remove('selected');
                } else {
                    
                    this.addJobTitle(jobTitle);
                    
                    
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
        // Show selected jobs as removable tags
        const selectedDisplay = document.getElementById('selectedJobsDisplay');
        
        if (this.selectedJobs.size > 0) {
            const jobTags = Array.from(this.selectedJobs).map(job => `
                <span class="badge bg-primary d-flex align-items-center" style="font-size: 0.9rem; padding: 0.5rem 0.75rem;">
                    <i class="fas fa-briefcase me-2"></i>
                    ${job}
                    <button class="btn-close btn-close-white ms-2" type="button" 
                            data-remove-job="${job}" aria-label="Remove ${job}"
                            style="font-size: 0.7rem;"></button>
                </span>
            `).join('');
            
            selectedDisplay.innerHTML = `
                <div class="d-flex flex-wrap gap-2">
                    ${jobTags}
                </div>
            `;
            
            // Bind remove events
            const removeButtons = selectedDisplay.querySelectorAll('[data-remove-job]');
            removeButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const jobToRemove = button.getAttribute('data-remove-job');
                    this.removeJobTitle(jobToRemove);
                });
            });
            
            selectedDisplay.style.display = 'block';
        } else {
            selectedDisplay.style.display = 'none';
        }
        
        // Always enable next button - users can proceed with custom input or selections
        this.enableNextButton();
    }

    updateCustomInputState(inputValue) {
        // Enable next button when there's custom input or selected jobs
        if (inputValue.length > 0 || this.selectedJobs.size > 0) {
            this.enableNextButton();
        }
        
        // Update placeholder or helper text based on input
        const jobInput = document.getElementById('jobTitleInput');
        if (inputValue.length >= 2) {
            jobInput.setAttribute('data-has-custom-input', 'true');
        } else {
            jobInput.removeAttribute('data-has-custom-input');
        }
    }

    skipJobSelection() {
        
        this.selectedJobs.clear();
        this.updateSelectedDisplay();
        
        
        this.trackSkipAction();
        
        
        this.goNext();
    }

    goBack() {
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            const originalText = backBtn.innerHTML;
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            backBtn.disabled = true;
        }
        
        
        setTimeout(() => {
            window.location.href = '/where-remote';
        }, 300);
    }

    goNext() {
        // Capture any remaining text in the input field
        const jobInput = document.getElementById('jobTitleInput');
        if (jobInput && jobInput.value.trim()) {
            const inputValue = jobInput.value.trim();
            this.addJobTitle(inputValue);
            jobInput.value = ''; // Clear the input after saving
        }
        
        // Store job preference (even if empty - user might want to skip)
        this.storeJobPreference();
        
        // Add loading state to next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            nextBtn.disabled = true;
        }
        
        // Navigate to next step
        setTimeout(() => {
            window.location.href = '/relevant-experience';
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
                
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-check');
                btn.classList.add('selected');
            } else {
                
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.classList.remove('selected');
            }
        });
    }

    trackJobSelection(jobTitle) {
        
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
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'job_selection_skipped', {
                page: 'what-job'
            });
        }

        console.log('Job selection skipped');
    }

    
    getJobPreference() {
        return {
            jobTitles: Array.from(this.selectedJobs)
        };
    }

    setJobPreference(jobTitles = []) {
        this.selectedJobs = new Set(jobTitles);
        this.updateSelectedDisplay();
    }

    
    handleNext() {
        this.goNext();
    }

    handleBack() {
        this.goBack();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    // Initialize wizard footer
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(4, 6, 'Next');
        
        // Set up event handlers
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
        
        // Enable next button immediately - users can proceed with custom input
        window.wizardFooter.enableNextButton();
    }
    
    
    window.whatJobPageInstance = new WhatJobPage();
});


if (typeof loadComponents === 'function') {
    loadComponents();
}


document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        window.headerInstance.setActiveNav('remote-jobs');
    }
});


window.WhatJobPage = WhatJobPage;
