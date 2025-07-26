// Initialize wizard header and footer
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard header with back button
    window.wizardHeader = new WizardHeader({
        isFirstPage: false,
        backUrl: '/salary-preference'
    });
    
    // Initialize wizard footer
    window.wizardFooter = new WizardFooter();
});

// Load header and footer components
loadComponents();

// Set active navigation when components are loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        window.headerInstance.setActiveNav('remote-jobs');
    }
});

// Page-specific functionality
class WhereRemotePage {
    constructor() {
        this.selectedLocation = '';
        this.selectedOptions = new Set();
        this.locationSuggestions = [
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
            'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
            'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
            'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
            'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD'
        ];
        
        this.init();
    }

    init() {
        this.setupLocationInput();
        this.setupLocationOptions();
        this.setupNavigation();
        this.restoreFromLocalStorage();
    }

    setupLocationInput() {
        const locationInput = document.getElementById('locationInput');
        const suggestionsContainer = document.getElementById('locationSuggestions');
        
        locationInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showLocationSuggestions(query);
            } else {
                this.hideLocationSuggestions();
            }
        });
        
        locationInput.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.hideLocationSuggestions();
            }, 200);
        });
        
        locationInput.addEventListener('focus', () => {
            const query = locationInput.value.trim();
            if (query.length >= 2) {
                this.showLocationSuggestions(query);
            }
        });
        
        // Handle Enter key
        locationInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = locationInput.value.trim();
                if (query) {
                    this.selectLocation(query);
                }
            }
        });
    }

    showLocationSuggestions(query) {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        const filteredSuggestions = this.locationSuggestions.filter(location =>
            location.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        
        if (filteredSuggestions.length > 0) {
            const suggestionsHTML = filteredSuggestions.map(location => `
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        onclick="whereRemotePageInstance.selectLocation('${location}')">
                    <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                    ${location}
                </button>
            `).join('');
            
            suggestionsContainer.innerHTML = `
                <div class="list-group mt-2 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    ${suggestionsHTML}
                </div>
            `;
            suggestionsContainer.classList.remove('d-none');
        } else {
            this.hideLocationSuggestions();
        }
    }

    hideLocationSuggestions() {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        suggestionsContainer.classList.add('d-none');
    }

    selectLocation(location) {
        const locationInput = document.getElementById('locationInput');
        locationInput.value = location;
        this.selectedLocation = location;
        this.hideLocationSuggestions();
        this.updateSelectedDisplay();
        this.storeLocationPreference();
    }

    setupLocationOptions() {
        const usCheckbox = document.getElementById('usAnywhere');
        const globalCheckbox = document.getElementById('globalAnywhere');
        
        usCheckbox.addEventListener('change', (e) => {
            this.handleOptionChange('us-anywhere', e.target.checked);
        });
        
        globalCheckbox.addEventListener('change', (e) => {
            this.handleOptionChange('global-anywhere', e.target.checked);
        });
    }

    handleOptionChange(option, isChecked) {
        if (isChecked) {
            this.selectedOptions.add(option);
        } else {
            this.selectedOptions.delete(option);
        }
        
        this.updateSelectedDisplay();
        this.storeLocationPreference();
        this.trackOptionSelection(option, isChecked);
    }

    updateSelectedDisplay() {
        const selectedDisplay = document.getElementById('selectedDisplay');
        const selectedLocationsList = document.getElementById('selectedLocationsList');
        
        const selections = [];
        
        if (this.selectedLocation) {
            selections.push({
                text: this.selectedLocation,
                icon: 'fas fa-map-marker-alt',
                color: 'primary'
            });
        }
        
        if (this.selectedOptions.has('us-anywhere')) {
            selections.push({
                text: 'Anywhere in US',
                icon: 'fas fa-flag-usa',
                color: 'primary'
            });
        }
        
        if (this.selectedOptions.has('global-anywhere')) {
            selections.push({
                text: 'Anywhere globally',
                icon: 'fas fa-globe',
                color: 'success'
            });
        }
        
        if (selections.length > 0) {
            const selectionsHTML = selections.map(selection => `
                <span class="badge bg-${selection.color} px-3 py-2">
                    <i class="${selection.icon} me-1"></i>
                    ${selection.text}
                </span>
            `).join('');
            
            selectedLocationsList.innerHTML = selectionsHTML;
            selectedDisplay.classList.remove('d-none');
        } else {
            selectedDisplay.classList.add('d-none');
        }
    }

    setupNavigation() {
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        backBtn.addEventListener('click', () => {
            this.goBack();
        });
        
        nextBtn.addEventListener('click', () => {
            this.goNext();
        });
    }

    goBack() {
        // Add loading animation
        const backBtn = document.getElementById('backBtn');
        const originalText = backBtn.innerHTML;
        backBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        backBtn.disabled = true;
        
        // Navigate back to salary preference page
        setTimeout(() => {
            window.location.href = '/salary-preference';
        }, 300);
    }

    goNext() {
        // Store location preference
        this.storeLocationPreference();
        
        // Add loading animation
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        nextBtn.disabled = true;
        
        // Navigate to next step (job title selection)
        setTimeout(() => {
            window.location.href = '/what-job';
        }, 500);
    }

    storeLocationPreference() {
        const preference = {
            location: this.selectedLocation,
            options: Array.from(this.selectedOptions),
            timestamp: Date.now()
        };
        
        localStorage.setItem('locationPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('locationPreference');
        if (stored) {
            try {
                const preference = JSON.parse(stored);
                
                if (preference.location) {
                    this.selectedLocation = preference.location;
                    document.getElementById('locationInput').value = preference.location;
                }
                
                if (preference.options) {
                    preference.options.forEach(option => {
                        this.selectedOptions.add(option);
                        const checkbox = document.getElementById(option === 'us-anywhere' ? 'usAnywhere' : 'globalAnywhere');
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                this.updateSelectedDisplay();
            } catch (e) {
                console.error('Error restoring location preference:', e);
            }
        }
    }

    trackOptionSelection(option, isChecked) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'location_option_changed', {
                option: option,
                selected: isChecked,
                page: 'where-remote'
            });
        }

        console.log('Location option changed:', { option, isChecked });
    }

    // Public methods for external access
    getLocationPreference() {
        return {
            location: this.selectedLocation,
            options: Array.from(this.selectedOptions)
        };
    }

    setLocationPreference(location, options = []) {
        this.selectedLocation = location;
        this.selectedOptions = new Set(options);
        
        // Update UI
        if (location) {
            document.getElementById('locationInput').value = location;
        }
        
        options.forEach(option => {
            const checkbox = document.getElementById(option === 'us-anywhere' ? 'usAnywhere' : 'globalAnywhere');
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        this.updateSelectedDisplay();
    }
}

// Initialize page when DOM is loaded
let whereRemotePageInstance;
document.addEventListener('DOMContentLoaded', () => {
    whereRemotePageInstance = new WhereRemotePage();
});

// Export for external access
window.whereRemotePageInstance = whereRemotePageInstance;
