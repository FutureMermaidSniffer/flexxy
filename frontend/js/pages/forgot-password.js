/**
 * Forgot Password Page JavaScript
 * Handles forgot password form submission and UI updates
 */

class ForgotPasswordManager {
    constructor() {
        this.form = document.getElementById('forgotPasswordForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.alertContainer = document.getElementById('alertContainer');
        this.successState = document.getElementById('successState');
        this.resendBtn = document.getElementById('resendBtn');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupValidation();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.resendBtn) {
            this.resendBtn.addEventListener('click', () => this.showForm());
        }
    }

    setupValidation() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', () => this.validateEmail());
        }
    }

    validateEmail() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            emailInput.classList.add('is-invalid');
            emailInput.nextElementSibling.textContent = 'Please enter a valid email address';
            return false;
        } else {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
            return true;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateEmail()) {
            return;
        }

        const formData = new FormData(this.form);
        const email = formData.get('email').trim();

        this.setLoading(true);
        this.clearAlerts();

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess(email);
                
                // Show debug token in development
                if (data.debug && data.debug.token) {
                    console.log('Reset token (development only):', data.debug.token);
                    this.showAlert('info', `Development mode: Reset token is ${data.debug.token}`);
                }
            } else {
                this.showAlert('danger', data.message || 'An error occurred. Please try again.');
            }

        } catch (error) {
            console.error('Forgot password error:', error);
            this.showAlert('danger', 'Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    showSuccess(email) {
        // Hide form
        this.form.style.display = 'none';
        
        // Update success message with email
        const successMessage = this.successState.querySelector('p');
        if (successMessage) {
            successMessage.innerHTML = `
                We've sent a password reset link to <strong>${email}</strong>. 
                Please check your inbox and follow the instructions.
            `;
        }
        
        // Show success state
        this.successState.classList.remove('d-none');
    }

    showForm() {
        // Show form
        this.form.style.display = 'block';
        
        // Hide success state
        this.successState.classList.add('d-none');
        
        // Clear form
        this.form.reset();
        this.clearValidation();
        this.clearAlerts();
    }

    setLoading(loading) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const spinner = this.submitBtn.querySelector('.spinner-border');

        if (loading) {
            this.submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            spinner.classList.remove('d-none');
        } else {
            this.submitBtn.disabled = false;
            btnText.textContent = 'Send Reset Link';
            spinner.classList.add('d-none');
        }
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        this.alertContainer.appendChild(alertDiv);

        // Auto-dismiss after 10 seconds for non-error alerts
        if (type !== 'danger') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 10000);
        }
    }

    clearAlerts() {
        this.alertContainer.innerHTML = '';
    }

    clearValidation() {
        const inputs = this.form.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
    }
}

// Utility functions for other pages to use
window.ForgotPasswordUtils = {
    addForgotPasswordLink: (loginFormSelector) => {
        const loginForm = document.querySelector(loginFormSelector);
        if (loginForm) {
            const forgotLink = loginForm.querySelector('a[href*="forgot"]');
            if (!forgotLink) {
                // Add forgot password link if it doesn't exist
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const linkContainer = document.createElement('div');
                    linkContainer.className = 'text-center mt-3';
                    linkContainer.innerHTML = `
                        <a href="forgot-password.html" class="text-primary text-decoration-none">
                            Forgot your password?
                        </a>
                    `;
                    submitBtn.parentNode.insertBefore(linkContainer, submitBtn.nextSibling);
                }
            }
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ForgotPasswordManager();
});
