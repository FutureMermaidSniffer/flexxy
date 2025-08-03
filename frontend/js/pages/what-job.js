



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
                        data-job-title="${job}">
                    <i class="fas fa-briefcase me-2 text-muted"></i>
                    ${job}
                </button>
            `).join('');
            
            suggestionsContainer.innerHTML = `
                <div class="list-group mt-2 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    ${suggestionsHTML}
                </div>
            `;
            
            
            const suggestionButtons = suggestionsContainer.querySelectorAll('[data-job-title]');
            suggestionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const jobTitle = button.getAttribute('data-job-title');
                    this.addJobTitle(jobTitle);
                });
            });
            
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
        
        
        this.enableNextButton();
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
            window.location.href = 'where-remote.html';
        }, 300);
    }

    goNext() {
        
        const jobInput = document.getElementById('jobTitleInput');
        if (jobInput && jobInput.value.trim()) {
            const inputValue = jobInput.value.trim();
            this.addJobTitle(inputValue);
        }
        
        
        this.storeJobPreference();
        
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            nextBtn.disabled = true;
        }
        
        
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
    
    
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(4, 6, 'Next');
        
        
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
        
        
        setTimeout(() => {
            window.wizardFooter.enableNextButton();
        }, 200);
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
