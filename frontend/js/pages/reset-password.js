/**
 * Reset Password Page JavaScript
 * Handles password reset form submission and validation
 */

class ResetPasswordManager {
    constructor() {
        this.form = document.getElementById('resetPasswordForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.alertContainer = document.getElementById('alertContainer');
        this.loadingState = document.getElementById('loadingState');
        this.invalidTokenState = document.getElementById('invalidTokenState');
        this.successState = document.getElementById('successState');
        this.backToLogin = document.getElementById('backToLogin');
        
        this.token = null;
        
        this.init();
    }

    init() {
        this.extractTokenFromURL();
        this.bindEvents();
        this.setupValidation();
        this.verifyToken();
    }

    extractTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token');
        
        if (!this.token) {
            this.showInvalidToken();
            return;
        }
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Password visibility toggles
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password'));
        }
        
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
        }
    }

    setupValidation() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.validatePassword();
                this.updatePasswordStrength();
                this.validatePasswordMatch();
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    async verifyToken() {
        if (!this.token) {
            return;
        }

        try {
            const response = await fetch(`/api/auth/verify-reset-token/${this.token}`);
            const data = await response.json();

            if (response.ok && data.valid) {
                this.showForm(data.email);
            } else {
                this.showInvalidToken();
            }

        } catch (error) {
            console.error('Token verification error:', error);
            this.showInvalidToken();
        }
    }

    showForm(email) {
        this.loadingState.classList.add('d-none');
        this.form.classList.remove('d-none');
        this.backToLogin.classList.remove('d-none');

        // Show email in form if available
        if (email) {
            this.showAlert('info', `Resetting password for: ${email}`);
        }
    }

    showInvalidToken() {
        this.loadingState.classList.add('d-none');
        this.invalidTokenState.classList.remove('d-none');
        this.backToLogin.classList.add('d-none');
    }

    validatePassword() {
        const passwordInput = document.getElementById('password');
        const password = passwordInput.value;

        if (password.length > 0 && password.length < 6) {
            passwordInput.classList.add('is-invalid');
            passwordInput.nextElementSibling.nextElementSibling.textContent = 'Password must be at least 6 characters long';
            return false;
        } else if (password.length >= 6) {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            return true;
        } else {
            passwordInput.classList.remove('is-invalid', 'is-valid');
            return false;
        }
    }

    validatePasswordMatch() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length > 0) {
            if (password !== confirmPassword) {
                confirmPasswordInput.classList.add('is-invalid');
                confirmPasswordInput.nextElementSibling.nextElementSibling.textContent = 'Passwords do not match';
                return false;
            } else {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
                return true;
            }
        } else {
            confirmPasswordInput.classList.remove('is-invalid', 'is-valid');
            return false;
        }
    }

    updatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthFill = document.getElementById('passwordStrengthFill');
        const strengthText = document.getElementById('passwordStrengthText');

        if (password.length === 0) {
            strengthFill.className = 'password-strength-fill';
            strengthText.textContent = 'Enter a password to see strength';
            return;
        }

        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score += 1;
        else feedback.push('at least 8 characters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('uppercase letter');

        // Lowercase check
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('lowercase letter');

        // Number check
        if (/\d/.test(password)) score += 1;
        else feedback.push('number');

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('special character');

        // Update strength indicator
        strengthFill.className = 'password-strength-fill';
        
        if (score <= 1) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.className = 'password-strength-text text-danger';
        } else if (score === 2) {
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Fair password';
            strengthText.className = 'password-strength-text text-warning';
        } else if (score === 3) {
            strengthFill.classList.add('good');
            strengthText.textContent = 'Good password';
            strengthText.className = 'password-strength-text text-info';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
            strengthText.className = 'password-strength-text text-success';
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(`toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`);

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const isPasswordValid = this.validatePassword();
        const isMatchValid = this.validatePasswordMatch();

        if (!isPasswordValid || !isMatchValid) {
            return;
        }

        const formData = new FormData(this.form);
        const password = formData.get('password');

        this.setLoading(true);
        this.clearAlerts();

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.token,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess();
            } else {
                this.showAlert('danger', data.message || 'An error occurred. Please try again.');
            }

        } catch (error) {
            console.error('Reset password error:', error);
            this.showAlert('danger', 'Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    showSuccess() {
        this.form.classList.add('d-none');
        this.successState.classList.remove('d-none');
        this.backToLogin.classList.add('d-none');
    }

    setLoading(loading) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const spinner = this.submitBtn.querySelector('.spinner-border');

        if (loading) {
            this.submitBtn.disabled = true;
            btnText.textContent = 'Resetting...';
            spinner.classList.remove('d-none');
        } else {
            this.submitBtn.disabled = false;
            btnText.textContent = 'Reset Password';
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResetPasswordManager();
});
