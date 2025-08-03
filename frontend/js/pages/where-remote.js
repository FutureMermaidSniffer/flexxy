


document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(4, 6, 'Next');
        
        window.wizardFooter.handleNext = () => {
            window.whereRemotePageInstance.handleNext();
        };
        
        window.wizardFooter.handleBack = () => {
            window.whereRemotePageInstance.handleBack();
        };
        
        window.wizardFooter.enableNextButton();
    }
    
    
    window.whereRemotePageInstance = new WhereRemotePage();
});

class WhereRemotePage {
    constructor() {
        this.selectedLocation = '';
        this.selectedOptions = new Set();
        this.hasInteracted = false;
        this.locationSuggestions = [
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
            'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
            'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
            'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
            'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
            'Remote - US Only', 'Remote - Global', 'Work from Home'
        ];
        
        this.init();
    }

    init() {
        this.setupLocationSearch();
        this.setupLocationOptions();
        this.setupNavigation();
        this.restoreFromLocalStorage();
    }

    setupLocationSearch() {
        const locationInput = document.getElementById('locationInput');
        const suggestionsContainer = document.getElementById('locationSuggestions');
        
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this.hasInteracted = true;
                
                if (query.length >= 2) {
                    this.showLocationSuggestions(query);
                } else {
                    this.hideLocationSuggestions();
                }
                
                if (query.length > 0) {
                    this.selectedLocation = query;
                    this.updateSelectedDisplay();
                }
            });
            
            locationInput.addEventListener('blur', () => {
                
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
    }

    showLocationSuggestions(query) {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        if (!suggestionsContainer) return;
        
        const filteredSuggestions = this.locationSuggestions.filter(location =>
            location.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        
        if (filteredSuggestions.length > 0) {
            const suggestionsHTML = filteredSuggestions.map(location => `
                <button class="suggestion-item" onclick="window.whereRemotePageInstance.selectLocation('${location.replace(/'/g, "\\'")}')">
                    <i class="fas fa-map-marker-alt"></i>
                    ${location}
                </button>
            `).join('');
            
            suggestionsContainer.innerHTML = `
                <div class="suggestions-list">
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
        if (suggestionsContainer) {
            suggestionsContainer.classList.add('d-none');
        }
    }

    selectLocation(location) {
        const locationInput = document.getElementById('locationInput');
        if (locationInput) {
            locationInput.value = location;
        }
        
        this.selectedLocation = location;
        this.hasInteracted = true;
        this.hideLocationSuggestions();
        this.updateSelectedDisplay();
        this.saveToLocalStorage();
    }

    setupLocationOptions() {
        const checkboxes = document.querySelectorAll('.option-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const option = e.target.dataset.option;
                const isChecked = e.target.checked;
                this.handleOptionChange(option, isChecked);
            });
        });
    }

    handleOptionChange(option, isChecked) {
        this.hasInteracted = true;
        
        if (isChecked) {
            this.selectedOptions.add(option);
        } else {
            this.selectedOptions.delete(option);
        }
        
        this.updateSelectedDisplay();
        this.saveToLocalStorage();
    }

    updateSelectedDisplay() {
        const selectedDisplay = document.getElementById('selectedDisplay');
        const selectedLocationsList = document.getElementById('selectedLocationsList');
        
        if (!selectedDisplay || !selectedLocationsList) return;
        
        const selections = [];
        
        if (this.selectedLocation && this.selectedLocation.trim()) {
            selections.push({
                text: this.selectedLocation,
                icon: 'fas fa-map-marker-alt'
            });
        }
        
        if (this.selectedOptions.has('us-anywhere')) {
            selections.push({
                text: 'US',
                icon: 'fas fa-flag-usa'
            });
        }
        
        if (this.selectedOptions.has('global-anywhere')) {
            selections.push({
                text: 'Globally',
                icon: 'fas fa-globe'
            });
        }
        
        if (selections.length > 0) {
            const selectionsHTML = selections.map(selection => `
                <span class="selected-item">
                    <i class="${selection.icon}"></i>
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
        const nextBtn = document.getElementById('nextBtn');
        const skipLink = document.getElementById('skipLink');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.handleNext();
            });
        }
        
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.skip();
            });
        }
    }

    handleNext() {
        
        this.saveToLocalStorage();
        
        
        window.location.href = 'what-job.html';
    }

    handleBack() {
        
        window.location.href = 'why-remote.html';
    }

    skip() {
        
        localStorage.removeItem('locationPreference');
        
        
        window.location.href = 'what-job.html';
    }

    saveToLocalStorage() {
        const preference = {
            location: this.selectedLocation,
            options: Array.from(this.selectedOptions),
            hasInteracted: this.hasInteracted,
            timestamp: Date.now()
        };
        
        localStorage.setItem('locationPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const saved = localStorage.getItem('locationPreference');
        if (saved) {
            try {
                const preference = JSON.parse(saved);
                
                if (preference.location) {
                    this.selectedLocation = preference.location;
                    const locationInput = document.getElementById('locationInput');
                    if (locationInput) {
                        locationInput.value = preference.location;
                    }
                }
                
                if (preference.options) {
                    preference.options.forEach(option => {
                        this.selectedOptions.add(option);
                        const checkbox = document.querySelector(`[data-option="${option}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                this.hasInteracted = preference.hasInteracted || false;
                this.updateSelectedDisplay();
            } catch (error) {
                console.error('Error restoring location preference:', error);
            }
        }
    }

    
    getLocationPreference() {
        return {
            location: this.selectedLocation,
            options: Array.from(this.selectedOptions),
            hasInteracted: this.hasInteracted
        };
    }

    setLocationPreference(location, options = []) {
        this.selectedLocation = location;
        this.selectedOptions = new Set(options);
        this.hasInteracted = true;
        
        
        const locationInput = document.getElementById('locationInput');
        if (locationInput && location) {
            locationInput.value = location;
        }
        
        options.forEach(option => {
            const checkbox = document.querySelector(`[data-option="${option}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        this.updateSelectedDisplay();
    }
}
