// Registration Page JavaScript
// Handles registration form and modal functionality

class RegistrationPage {
    constructor() {
        this.isModalOpen = true; // Modal opens automatically
        this.init();
    }

    init() {
        // Setup modal functionality
        this.setupModal();
        
        // Setup form functionality
        this.setupRegistrationForm();
        
        // Setup password toggle
        this.setupPasswordToggle();
        
        // Show modal automatically
        this.showModal();
        
        console.log('Registration page initialized');
    }

    setupModal() {
        const closeBtn = document.getElementById('closeModal');
        const modalBackdrop = document.getElementById('modalBackdrop');
        
        // Close modal on close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Close modal on backdrop click
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
        });
    }

    setupRegistrationForm() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
        
        // Setup form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.validateEmail(emailInput);
            });
            
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.validatePassword(passwordInput);
            });
        }
    }

    setupPasswordToggle() {
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('passwordInput');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                const icon = passwordToggle.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    }

    showModal() {
        const modal = document.getElementById('modalBackdrop');
        if (modal) {
            modal.style.display = 'flex';
            this.isModalOpen = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus on email input
            setTimeout(() => {
                const emailInput = document.getElementById('emailInput');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 300);
        }
    }

    closeModal() {
        const modal = document.getElementById('modalBackdrop');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    validateEmail(emailInput) {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            return false;
        } else {
            this.clearFieldError(emailInput);
            return true;
        }
    }

    validatePassword(passwordInput) {
        const password = passwordInput.value;
        
        if (password.length > 0 && password.length < 6) {
            this.showFieldError(passwordInput, 'Password must be at least 6 characters');
            return false;
        } else {
            this.clearFieldError(passwordInput);
            return true;
        }
    }

    showFieldError(input, message) {
        // Remove existing error
        this.clearFieldError(input);
        
        // Add error styling
        input.classList.add('is-invalid');
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        input.classList.remove('is-invalid');
        const errorMsg = input.parentNode.querySelector('.invalid-feedback');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    async handleRegistration() {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const submitBtn = document.querySelector('.submit-btn');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        const isEmailValid = this.validateEmail(emailInput);
        const isPasswordValid = this.validatePassword(passwordInput);
        
        if (!email) {
            this.showFieldError(emailInput, 'Email is required');
            return;
        }
        
        if (!password) {
            this.showFieldError(passwordInput, 'Password is required');
            return;
        }
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating your account...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await this.registerUser(email, password);
            
            // Store registration data
            this.storeUserData(email);
            
            // Track successful registration
            this.trackRegistration(email);
            
            // Show success message briefly
            submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Account created!';
            
            // Redirect to job search results
            setTimeout(() => {
                window.location.href = 'job-search-results.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show error message
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            this.showRegistrationError(error.message || 'Registration failed. Please try again.');
        }
    }

    async registerUser(email, password) {
        // Simulate API registration call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (in real app, this would be an actual API call)
                if (email && password) {
                    resolve({ success: true, userId: Date.now() });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 2000);
        });
    }

    storeUserData(email) {
        const userData = {
            email: email,
            registrationDate: new Date().toISOString(),
            wizardCompleted: true,
            preferences: this.getUserPreferences()
        };
        
        try {
            localStorage.setItem('flexjobs_user_data', JSON.stringify(userData));
            console.log('User data stored successfully');
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    }

    getUserPreferences() {
        // Collect all wizard preferences
        const preferences = {};
        
        try {
            // Get job title preferences
            const jobPrefs = localStorage.getItem('jobTitlePreference');
            if (jobPrefs) {
                preferences.jobTitles = JSON.parse(jobPrefs);
            }
            
            // Get education preferences
            const eduPrefs = localStorage.getItem('educationPreference');
            if (eduPrefs) {
                preferences.education = JSON.parse(eduPrefs);
            }
            
            // Get benefit preferences
            const benefitPrefs = localStorage.getItem('benefitPreference');
            if (benefitPrefs) {
                preferences.benefits = JSON.parse(benefitPrefs);
            }
            
            // Get work experience preferences
            const expPrefs = localStorage.getItem('experiencePreference');
            if (expPrefs) {
                preferences.experience = JSON.parse(expPrefs);
            }
            
        } catch (error) {
            console.error('Error collecting preferences:', error);
        }
        
        return preferences;
    }

    showRegistrationError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.registration-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger registration-error';
            const form = document.getElementById('registrationForm');
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        `;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    trackRegistration(email) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_up', {
                method: 'email',
                email: email,
                conversion: true
            });
        }
        
        console.log('User registered:', email);
    }

    // Public methods
    reopenModal() {
        this.showModal();
    }

    getRegistrationData() {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        
        return {
            email: emailInput ? emailInput.value.trim() : '',
            password: passwordInput ? passwordInput.value : ''
        };
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.registrationPageInstance = new RegistrationPage();
});

// Export for external access
window.RegistrationPage = RegistrationPage;
