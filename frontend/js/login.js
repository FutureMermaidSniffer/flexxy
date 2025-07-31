// Login Page JavaScript
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.passwordInput = document.getElementById('password');
        this.emailInput = document.getElementById('email');
        this.loginBtn = this.form?.querySelector('.login-btn');
        this.btnText = this.loginBtn?.querySelector('.btn-text');
        this.btnSpinner = this.loginBtn?.querySelector('.btn-spinner');
        
        // Check if all required elements exist
        if (!this.form || !this.passwordInput || !this.emailInput || !this.loginBtn) {
            console.error('Login form elements not found');
            return;
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = btn.textContent.includes('Google') ? 'google' : 'apple';
                this.handleSocialLogin(provider);
            });
        });

        // Real-time validation
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        
        // Clear validation on input
        this.emailInput.addEventListener('input', () => this.clearValidation(this.emailInput));
        this.passwordInput.addEventListener('input', () => this.clearValidation(this.passwordInput));
    }

    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            this.passwordInput.setAttribute('type', type);
            
            const icon = this.passwordToggle.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    setupFormValidation() {
        // Bootstrap form validation
        this.form.classList.add('needs-validation');
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showFieldError(this.emailInput, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showFieldError(this.emailInput, 'Please enter a valid email address');
            return false;
        }
        
        this.clearValidation(this.emailInput);
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showFieldError(this.passwordInput, 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showFieldError(this.passwordInput, 'Password must be at least 6 characters');
            return false;
        }
        
        this.clearValidation(this.passwordInput);
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling?.classList.contains('invalid-feedback') ? 
                        field.nextElementSibling : null;
        
        if (feedback) {
            feedback.textContent = message;
        }
    }

    clearValidation(field) {
        field.classList.remove('is-invalid', 'is-valid');
        
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling?.classList.contains('invalid-feedback') ? 
                        field.nextElementSibling : null;
        
        if (feedback) {
            feedback.textContent = '';
        }
    }

    showLoadingState() {
        this.loginBtn.disabled = true;
        this.btnText.classList.add('d-none');
        this.btnSpinner.classList.remove('d-none');
    }

    hideLoadingState() {
        this.loginBtn.disabled = false;
        this.btnText.classList.remove('d-none');
        this.btnSpinner.classList.add('d-none');
    }

    async handleLogin() {
        // Validate form
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.showNotification('Please fix the errors below', 'error');
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            const formData = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                rememberMe: document.getElementById('rememberMe')?.checked || false
            };

            // Make API call to login endpoint
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store authentication data using consistent naming
                localStorage.setItem('flexjobs_token', data.token);
                localStorage.setItem('flexjobs_user', JSON.stringify(data.user));
                
                this.showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect after a short delay
                setTimeout(() => {
                    // Check if user is admin and redirect accordingly
                    if (data.user && data.user.user_type === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'browse-jobs.html';
                        window.location.href = redirectUrl;
                    }
                }, 1500);
            } else {
                this.showNotification(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    async handleSocialLogin(provider) {
        try {
            if (provider === 'google') {
                // Redirect to Google OAuth
                window.location.href = '/api/auth/google';
            } else if (provider === 'apple') {
                // For Apple, we'll use Sign In with Apple JS SDK
                this.initializeAppleSignIn();
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            this.showNotification(`${provider} login failed. Please try again.`, 'error');
        }
    }

    initializeAppleSignIn() {
        // Check if Apple Sign In is available
        if (typeof AppleID !== 'undefined') {
            AppleID.auth.init({
                clientId: 'your-apple-client-id', // Replace with your Apple client ID
                scope: 'name email',
                redirectURI: window.location.origin + '/login',
                state: 'apple-signin',
                usePopup: true
            });

            AppleID.auth.signIn().then((data) => {
                // Handle Apple sign-in response
                this.handleAppleCallback(data);
            }).catch((error) => {
                console.error('Apple Sign In error:', error);
                this.showNotification('Apple Sign In failed. Please try again.', 'error');
            });
        } else {
            // Fallback if Apple SDK is not loaded
            this.showNotification('Apple Sign In is not available. Please try again later.', 'warning');
        }
    }

    async handleAppleCallback(appleData) {
        try {
            this.showLoadingState();

            const response = await fetch('/api/auth/apple/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_token: appleData.authorization.id_token,
                    user_info: appleData.user || {}
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store authentication data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                this.showNotification('Apple Sign In successful! Redirecting...', 'success');
                
                // Redirect after a short delay
                setTimeout(() => {
                    // Check if user is admin and redirect accordingly
                    if (data.user && data.user.user_type === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'browse-jobs.html';
                        window.location.href = redirectUrl;
                    }
                }, 1500);
            } else {
                this.showNotification(data.message || 'Apple Sign In failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Apple callback error:', error);
            this.showNotification('Apple Sign In failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    showNotification(message, type = 'info') {
        const modal = document.getElementById('notificationModal');
        const icon = document.getElementById('notificationIcon');
        const title = document.getElementById('notificationModalLabel');
        const messageElement = document.getElementById('notificationMessage');
        
        // Set icon and styling based on type
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle', 
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        const titleMap = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning', 
            info: 'Information'
        };
        
        icon.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i>`;
        icon.className = `notification-icon me-3 ${type}`;
        title.textContent = titleMap[type] || titleMap.info;
        messageElement.textContent = message;
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Utility Functions
class LoginUtils {
    static checkAuthState() {
        const token = localStorage.getItem('flexjobs_token');
        const user = localStorage.getItem('flexjobs_user');
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                // Check if user is admin and redirect accordingly
                if (userData.user_type === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    // User is already logged in, redirect to dashboard
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'browse-jobs.html';
                    window.location.href = redirectUrl;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // If there's an error parsing user data, clear storage and stay on login page
                localStorage.removeItem('flexjobs_token');
                localStorage.removeItem('flexjobs_user');
            }
        }
    }

    static handleOAuthRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const success = urlParams.get('success');
        const error = urlParams.get('error');

        if (token && success) {
            // OAuth success - store token and redirect using consistent naming
            localStorage.setItem('flexjobs_token', token);
            
            // Fetch user data with the token
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    localStorage.setItem('flexjobs_user', JSON.stringify(data.user));
                    
                    // Show success message
                    const loginManager = new LoginManager();
                    loginManager.showNotification('Login successful! Welcome back!', 'success');
                    
                    // Redirect after delay
                    setTimeout(() => {
                        // Check if user is admin and redirect accordingly
                        if (data.user && data.user.user_type === 'admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else {
                            const redirectUrl = urlParams.get('redirect') || 'browse-jobs.html';
                            window.location.href = redirectUrl;
                        }
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Error verifying OAuth token:', err);
                const loginManager = new LoginManager();
                loginManager.showNotification('Authentication verification failed. Please try again.', 'error');
            });

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error) {
            // OAuth error
            const loginManager = new LoginManager();
            const errorMessages = {
                'google_auth_failed': 'Google authentication failed. Please try again.',
                'apple_auth_failed': 'Apple authentication failed. Please try again.',
                'access_denied': 'Access was denied. Please try again.',
                'invalid_request': 'Invalid authentication request. Please try again.'
            };
            
            const message = errorMessages[error] || 'Authentication failed. Please try again.';
            loginManager.showNotification(message, 'error');

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    static setupRememberMe() {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const emailInput = document.getElementById('email');
        
        // Load remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
        
        // Save/remove email based on checkbox
        rememberMeCheckbox.addEventListener('change', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        });
        
        // Update remembered email as user types
        emailInput.addEventListener('input', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            }
        });
    }

    static setupForgotPassword() {
        const forgotPasswordLink = document.querySelector('.forgot-password-link');
        
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // In a real implementation, you would show a forgot password modal or redirect
            const loginManager = new LoginManager();
            loginManager.showNotification('Forgot password functionality will be implemented soon.', 'info');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Handle OAuth redirects first
    LoginUtils.handleOAuthRedirect();
    
    // Check if user is already logged in
    LoginUtils.checkAuthState();
    
    // Initialize login manager
    const loginManager = new LoginManager();
    
    // Setup additional utilities
    LoginUtils.setupRememberMe();
    LoginUtils.setupForgotPassword();
    
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Export for potential use by other modules
window.LoginManager = LoginManager;
window.LoginUtils = LoginUtils;
