/**
 * Salary Preference Page JavaScript
 * Handles salary slider, annual/hourly toggle, and wizard navigation
 */

// Initialize wizard header and footer
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard header (step 3 - show back button)
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    // Initialize wizard footer
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(3, 6, 'Next');
        // Override the handleNext method
        window.wizardFooter.handleNext = () => {
            window.salaryPreferencePageInstance.handleNext();
        };
        // Override the handleBack method
        window.wizardFooter.handleBack = () => {
            window.salaryPreferencePageInstance.handleBack();
        };
        // Enable by default since salary preference isn't required
        window.wizardFooter.enableNextButton();
    }
    
    // Initialize page functionality
    window.salaryPreferencePageInstance = new SalaryPreferencePage();
});

class SalaryPreferencePage {
    constructor() {
        this.currentValue = 65000;
        this.salaryType = 'annually';
        this.previousSalaryType = 'annually'; // Track previous type for proper conversion
        this.hasInteracted = false;
        this.ranges = {
            annually: { min: 0, max: 200000, step: 1000 },
            hourly: { min: 0, max: 100, step: 1 }
        };
        
        this.init();
    }

    init() {
        this.setupSlider();
        this.setupToggle();
        this.setupBubbleDrag(); // Add bubble drag functionality
        this.setupNavigation();
        this.setInitialSliderValue(); // Set slider to current value
        this.updateDisplay();
        this.updateSliderFill();
        this.updateBubble();
        this.restoreFromLocalStorage();
    }

    setInitialSliderValue() {
        const slider = document.getElementById('salarySlider');
        if (slider) {
            slider.value = this.currentValue;
        }
    }

    setupSlider() {
        const slider = document.getElementById('salarySlider');
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                this.currentValue = parseInt(e.target.value);
                this.hasInteracted = true;
                this.updateDisplay();
                this.updateSliderFill();
                this.updateBubble();
                this.showSuccessMessage();
            });
        }
    }

    setupToggle() {
        const toggles = document.querySelectorAll('input[name="salaryType"]');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Store the previous type before changing
                    this.previousSalaryType = this.salaryType;
                    this.salaryType = e.target.value;
                    this.updateSliderRange();
                    this.updateDisplay();
                    this.updateSliderFill();
                    this.updateBubble();
                    this.hasInteracted = true;
                }
            });
        });
    }

    setupBubbleDrag() {
        const bubble = document.getElementById('salaryBubble');
        const slider = document.getElementById('salarySlider');
        const sliderWrapper = document.querySelector('.salary-slider-wrapper');
        
        if (!bubble || !slider || !sliderWrapper) return;
        
        let isDragging = false;
        let startX = 0;
        let startValue = this.currentValue;
        
        // Mouse events
        bubble.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startValue = this.currentValue;
            bubble.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = sliderWrapper.getBoundingClientRect();
            const sliderWidth = rect.width;
            const deltaX = e.clientX - startX;
            const deltaPercentage = (deltaX / sliderWidth) * 100;
            
            // Calculate new value
            const range = slider.max - slider.min;
            const deltaValue = (deltaPercentage / 100) * range;
            const newValue = Math.max(slider.min, Math.min(slider.max, startValue + deltaValue));
            
            // Round to step
            const step = parseInt(slider.step);
            this.currentValue = Math.round(newValue / step) * step;
            
            // Update slider value
            slider.value = this.currentValue;
            
            // Update UI
            this.hasInteracted = true;
            this.updateDisplay();
            this.updateSliderFill();
            this.updateBubble();
            this.showSuccessMessage();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                bubble.style.cursor = 'grab';
            }
        });
        
        // Touch events for mobile
        bubble.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startValue = this.currentValue;
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const rect = sliderWrapper.getBoundingClientRect();
            const sliderWidth = rect.width;
            const deltaX = e.touches[0].clientX - startX;
            const deltaPercentage = (deltaX / sliderWidth) * 100;
            
            // Calculate new value
            const range = slider.max - slider.min;
            const deltaValue = (deltaPercentage / 100) * range;
            const newValue = Math.max(slider.min, Math.min(slider.max, startValue + deltaValue));
            
            // Round to step
            const step = parseInt(slider.step);
            this.currentValue = Math.round(newValue / step) * step;
            
            // Update slider value
            slider.value = this.currentValue;
            
            // Update UI
            this.hasInteracted = true;
            this.updateDisplay();
            this.updateSliderFill();
            this.updateBubble();
            this.showSuccessMessage();
            
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
            }
        });
        
        // Make bubble visually draggable
        bubble.style.cursor = 'grab';
        bubble.style.userSelect = 'none';
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

    updateSliderRange() {
        const slider = document.getElementById('salarySlider');
        const minLabel = document.getElementById('minLabel');
        const maxLabel = document.getElementById('maxLabel');
        
        if (!slider) return;
        
        const range = this.ranges[this.salaryType];
        
        // Only convert if the salary type actually changed
        if (this.previousSalaryType !== this.salaryType) {
            if (this.salaryType === 'hourly' && this.previousSalaryType === 'annually') {
                // Convert annual to hourly (assuming 2080 work hours per year)
                this.currentValue = Math.round(this.currentValue / 2080);
            } else if (this.salaryType === 'annually' && this.previousSalaryType === 'hourly') {
                // Convert hourly to annual
                this.currentValue = Math.round(this.currentValue * 2080);
            }
            
            // Update the previous type tracker
            this.previousSalaryType = this.salaryType;
        }
        
        // Ensure the value is within the valid range
        this.currentValue = Math.max(range.min, Math.min(range.max, this.currentValue));
        
        // Update slider attributes
        slider.min = range.min;
        slider.max = range.max;
        slider.step = range.step;
        slider.value = this.currentValue;
        
        // Update labels
        if (minLabel) {
            minLabel.textContent = this.salaryType === 'hourly' ? '$0' : '$0';
        }
        if (maxLabel) {
            maxLabel.textContent = this.salaryType === 'hourly' ? '$100+' : '$200K+';
        }
    }

    updateDisplay() {
        const display = document.getElementById('salaryDisplay');
        if (!display) return;
        
        const formattedValue = this.formatCurrency(this.currentValue);
        const suffix = this.salaryType === 'hourly' ? ' per hour' : ' per year';
        
        display.textContent = `${formattedValue}${suffix}`;
    }

    updateSliderFill() {
        const slider = document.getElementById('salarySlider');
        const fill = document.querySelector('.salary-slider-fill');
        
        if (!slider || !fill) return;
        
        const percentage = ((this.currentValue - slider.min) / (slider.max - slider.min)) * 100;
        fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }

    updateBubble() {
        const slider = document.getElementById('salarySlider');
        const bubble = document.getElementById('salaryBubble');
        const bubbleAmount = document.getElementById('salaryBubbleAmount');
        const bubbleFrequency = document.getElementById('salaryBubbleFrequency');
        
        if (!slider || !bubble || !bubbleAmount || !bubbleFrequency) return;
        
        // Calculate position as percentage
        const percentage = ((this.currentValue - slider.min) / (slider.max - slider.min)) * 100;
        
        // Position the bubble
        bubble.style.left = `${percentage}%`;
        
        // Update bubble content
        const formattedValue = this.formatCurrency(this.currentValue);
        const frequency = this.salaryType === 'hourly' ? 'per hour' : 'per year';
        
        bubbleAmount.textContent = formattedValue;
        bubbleFrequency.textContent = frequency;
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        } else {
            return `$${amount}`;
        }
    }

    showSuccessMessage() {
        // Show brief success indicator
        const card = document.querySelector('.salary-amount-box');
        if (card) {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        }
    }

    handleNext() {
        // Store preference
        this.saveToLocalStorage();
        
        // Navigate to next step
        window.location.href = 'where-remote.html';
    }

    handleBack() {
        // Navigate to previous step (work type page)
        window.location.href = 'work-type.html';
    }

    skip() {
        // Clear any saved preference
        localStorage.removeItem('salaryPreference');
        
        // Navigate to next step
        window.location.href = 'where-remote.html';
    }

    saveToLocalStorage() {
        const preference = {
            value: this.currentValue,
            type: this.salaryType,
            hasInteracted: this.hasInteracted,
            timestamp: Date.now()
        };
        
        localStorage.setItem('salaryPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const saved = localStorage.getItem('salaryPreference');
        if (saved) {
            try {
                const preference = JSON.parse(saved);
                this.currentValue = preference.value || this.currentValue;
                this.salaryType = preference.type || this.salaryType;
                this.hasInteracted = preference.hasInteracted || false;
                
                // Update UI
                const typeRadio = document.getElementById(this.salaryType);
                if (typeRadio) {
                    typeRadio.checked = true;
                }
                
                this.updateSliderRange();
                this.updateDisplay();
                this.updateSliderFill();
                this.updateBubble();
            } catch (error) {
                console.error('Error restoring salary preference:', error);
            }
        }
    }

    // Public methods for external access
    getSalaryPreference() {
        return {
            value: this.currentValue,
            type: this.salaryType,
            hasInteracted: this.hasInteracted
        };
    }

    setSalaryPreference(value, type = 'annually') {
        this.currentValue = value;
        this.salaryType = type;
        this.hasInteracted = true;
        
        // Update UI
        const typeRadio = document.getElementById(type);
        if (typeRadio) {
            typeRadio.checked = true;
        }
        
        this.updateSliderRange();
        this.updateDisplay();
        this.updateSliderFill();
        this.updateBubble();
    }
}
