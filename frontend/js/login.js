
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.passwordInput = document.getElementById('password');
        this.emailInput = document.getElementById('email');
        this.loginBtn = this.form?.querySelector('.login-btn');
        this.btnText = this.loginBtn?.querySelector('.btn-text');
        this.btnSpinner = this.loginBtn?.querySelector('.btn-spinner');
        
        
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
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = btn.textContent.includes('Google') ? 'google' : 'apple';
                this.handleSocialLogin(provider);
            });
        });

        
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        
        
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
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.showNotification('Please fix the errors below', 'error');
            return;
        }

        
        this.showLoadingState();

        try {
            const formData = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                rememberMe: document.getElementById('rememberMe')?.checked || false
            };

            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                
                localStorage.setItem('flexjobs_token', data.token);
                localStorage.setItem('flexjobs_user', JSON.stringify(data.user));
                
                this.showNotification('Login successful! Redirecting...', 'success');
                
                
                setTimeout(() => {
                    
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
                
                window.location.href = '/api/auth/google';
            } else if (provider === 'apple') {
                
                this.initializeAppleSignIn();
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            this.showNotification(`${provider} login failed. Please try again.`, 'error');
        }
    }

    initializeAppleSignIn() {
        
        if (typeof AppleID !== 'undefined') {
            AppleID.auth.init({
                clientId: 'your-apple-client-id', 
                scope: 'name email',
                redirectURI: window.location.origin + '/login',
                state: 'apple-signin',
                usePopup: true
            });

            AppleID.auth.signIn().then((data) => {
                
                this.handleAppleCallback(data);
            }).catch((error) => {
                console.error('Apple Sign In error:', error);
                this.showNotification('Apple Sign In failed. Please try again.', 'error');
            });
        } else {
            
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
                
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                this.showNotification('Apple Sign In successful! Redirecting...', 'success');
                
                
                setTimeout(() => {
                    
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
        
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}


class LoginUtils {
    static checkAuthState() {
        const token = localStorage.getItem('flexjobs_token');
        const user = localStorage.getItem('flexjobs_user');
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                
                if (userData.user_type === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'browse-jobs.html';
                    window.location.href = redirectUrl;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                
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
            
            localStorage.setItem('flexjobs_token', token);
            
            
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    localStorage.setItem('flexjobs_user', JSON.stringify(data.user));
                    
                    
                    const loginManager = new LoginManager();
                    loginManager.showNotification('Login successful! Welcome back!', 'success');
                    
                    
                    setTimeout(() => {
                        
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

            
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error) {
            
            const loginManager = new LoginManager();
            const errorMessages = {
                'google_auth_failed': 'Google authentication failed. Please try again.',
                'apple_auth_failed': 'Apple authentication failed. Please try again.',
                'access_denied': 'Access was denied. Please try again.',
                'invalid_request': 'Invalid authentication request. Please try again.'
            };
            
            const message = errorMessages[error] || 'Authentication failed. Please try again.';
            loginManager.showNotification(message, 'error');

            
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    static setupRememberMe() {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const emailInput = document.getElementById('email');
        
        
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
        
        
        rememberMeCheckbox.addEventListener('change', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        });
        
        
        emailInput.addEventListener('input', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            }
        });
    }

}


document.addEventListener('DOMContentLoaded', () => {
    
    LoginUtils.handleOAuthRedirect();
    
    
    LoginUtils.checkAuthState();
    
    
    const loginManager = new LoginManager();
    
    
    LoginUtils.setupRememberMe();
    
    
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


window.LoginManager = LoginManager;
window.LoginUtils = LoginUtils;
