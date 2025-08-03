


class RegistrationPage {
    constructor() {
        this.isModalOpen = true; 
        this.init();
    }

    init() {
        
        this.setupModal();
        
        
        this.setupRegistrationForm();
        
        
        this.setupPasswordToggle();
        
        
        this.setupSkipButton();
        
        
        this.showModal();
        
        console.log('Registration page initialized');
    }

    setupModal() {
        const closeBtn = document.getElementById('closeModal');
        const modalBackdrop = document.getElementById('modalBackdrop');
        
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) {
                    this.closeModal();
                }
            });
        }
        
        
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
        
        
        this.setupFormValidation();
    }

    setupFormValidation() {
        const firstNameInput = document.getElementById('firstNameInput');
        const lastNameInput = document.getElementById('lastNameInput');
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const phoneInput = document.getElementById('phoneInput');
        const locationInput = document.getElementById('locationInput');
        
        
        if (firstNameInput) {
            firstNameInput.addEventListener('input', () => {
                this.clearFieldError(firstNameInput);
            });
        }
        
        if (lastNameInput) {
            lastNameInput.addEventListener('input', () => {
                this.clearFieldError(lastNameInput);
            });
        }
        
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
        
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.clearFieldError(phoneInput);
            });
        }
        
        if (locationInput) {
            locationInput.addEventListener('input', () => {
                this.clearFieldError(locationInput);
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

    setupSkipButton() {
        const skipBtn = document.getElementById('skipRegistration');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.handleSkipRegistration();
            });
        }
    }

    handleSkipRegistration() {
        
        this.trackSkipRegistration();
        
        
        const skipBtn = document.getElementById('skipRegistration');
        const originalText = skipBtn.textContent;
        skipBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        skipBtn.disabled = true;
        
        
        setTimeout(() => {
            this.closeModal();
            window.location.href = 'browse-jobs.html';
        }, 800);
    }

    showModal() {
        const modal = document.getElementById('modalBackdrop');
        if (modal) {
            modal.style.display = 'flex';
            this.isModalOpen = true;
            
            
            document.body.style.overflow = 'hidden';
            
            
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
        
        this.clearFieldError(input);
        
        
        input.classList.add('is-invalid');
        
        
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
        const firstNameInput = document.getElementById('firstNameInput');
        const lastNameInput = document.getElementById('lastNameInput');
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const phoneInput = document.getElementById('phoneInput');
        const locationInput = document.getElementById('locationInput');
        const userTypeInput = document.getElementById('userTypeInput');
        const submitBtn = document.querySelector('.submit-btn');
        
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const phone = phoneInput.value.trim();
        const location = locationInput.value.trim();
        const userType = userTypeInput.value || 'job_seeker';
        
        
        let hasErrors = false;
        
        if (!firstName) {
            this.showFieldError(firstNameInput, 'First name is required');
            hasErrors = true;
        }
        
        if (!lastName) {
            this.showFieldError(lastNameInput, 'Last name is required');
            hasErrors = true;
        }
        
        if (!email) {
            this.showFieldError(emailInput, 'Email is required');
            hasErrors = true;
        }
        
        if (!password) {
            this.showFieldError(passwordInput, 'Password is required');
            hasErrors = true;
        }
        
        
        const isEmailValid = this.validateEmail(emailInput);
        const isPasswordValid = this.validatePassword(passwordInput);
        
        if (!isEmailValid || !isPasswordValid || hasErrors) {
            return;
        }
        
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating your account...';
        submitBtn.disabled = true;
        
        try {
            
            const registrationData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
                user_type: userType,
                phone: phone || null,
                location: location || null
            };
            
            
            await this.registerUser(registrationData);
            
            
            this.storeUserData(registrationData);
            
            
            this.trackRegistration(email);
            
            
            submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Account created!';
            
            
            setTimeout(() => {
                window.location.href = 'browse-jobs.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            this.showRegistrationError(error.message || 'Registration failed. Please try again.');
        }
    }

    async registerUser(registrationData) {
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const result = await response.json();
        
        
        if (result.token) {
            localStorage.setItem('flexjobs_token', result.token);
            localStorage.setItem('flexjobs_user', JSON.stringify(result.user));
        }
        
        return result;
    }

    storeUserData(registrationData) {
        const userData = {
            email: registrationData.email,
            first_name: registrationData.first_name,
            last_name: registrationData.last_name,
            phone: registrationData.phone,
            location: registrationData.location,
            user_type: registrationData.user_type,
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
        
        const preferences = {};
        
        try {
            
            const jobPrefs = localStorage.getItem('jobTitlePreference');
            if (jobPrefs) {
                preferences.jobTitles = JSON.parse(jobPrefs);
            }
            
            
            const eduPrefs = localStorage.getItem('educationPreference');
            if (eduPrefs) {
                preferences.education = JSON.parse(eduPrefs);
            }
            
            
            const benefitPrefs = localStorage.getItem('benefitPreference');
            if (benefitPrefs) {
                preferences.benefits = JSON.parse(benefitPrefs);
            }
            
            
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
        
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    trackRegistration(email) {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_up', {
                method: 'email',
                email: email,
                conversion: true
            });
        }
        
        console.log('User registered:', email);
    }

    trackSkipRegistration() {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'registration_skipped', {
                page: 'registration',
                action: 'skip'
            });
        }
        
        console.log('User skipped registration');
    }

    
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


document.addEventListener('DOMContentLoaded', () => {
    window.registrationPageInstance = new RegistrationPage();
});


window.RegistrationPage = RegistrationPage;
