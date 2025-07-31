// Authentication functionality
class Auth {
    constructor() {
        this.token = localStorage.getItem('flexjobs_token');
        this.user = JSON.parse(localStorage.getItem('flexjobs_user') || 'null');
        this.logoutHandlersSetup = false; // Track if logout handlers are already setup
        this.init();
    }

    init() {
        this.updateNavbar();
        this.setupLogoutHandlers(); // Set up logout handlers once
        this.setupEventListeners();
        this.addAuthStyles(); // Add styles for auth links
        
        // Listen for main header ready event
        document.addEventListener('mainHeaderReady', () => {
            this.updateNavbar();
        });
        
        // Also check periodically if elements exist but navbar hasn't been updated
        this.checkNavbarElements();
        
        // Verify token if exists
        if (this.token) {
            this.verifyToken();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    // Add styles for auth links
    addAuthStyles() {
        if (!document.getElementById('authLinkStyles')) {
            const style = document.createElement('style');
            style.id = 'authLinkStyles';
            style.textContent = `
                .auth-link {
                    transition: color 0.3s ease;
                }
                .auth-link:hover,
                .auth-link:focus {
                    color: #ff6b35 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setToken(data.token);
                this.setUser(data.user);
                this.updateNavbar();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                // Reset form
                e.target.reset();
                
                this.showAlert('Login successful!', 'success');
                
                // Redirect to browse jobs page
                setTimeout(() => {
                    window.location.href = 'browse-jobs.html';
                }, 1000);
            } else {
                this.showAlert(data.message || 'Login failed', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Network error. Please try again.', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const userType = document.getElementById('userType').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    user_type: userType
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.setToken(data.token);
                this.setUser(data.user);
                this.updateNavbar();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                modal.hide();
                
                // Reset form
                e.target.reset();
                
                this.showAlert('Registration successful! Welcome to FlexJobs!', 'success');
                
                // Redirect to browse jobs page
                setTimeout(() => {
                    window.location.href = 'browse-jobs.html';
                }, 1000);
            } else {
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    this.showAlert(errorMessages, 'danger');
                } else {
                    this.showAlert(data.message || 'Registration failed', 'danger');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Network error. Please try again.', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                this.logout();
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('flexjobs_token', token);
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('flexjobs_user', JSON.stringify(user));
    }

    async logout() {
        try {
            // Call backend logout endpoint if token exists
            if (this.token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.log('Logout endpoint error:', error);
            // Continue with client-side logout even if server call fails
        }

        // Clear client-side data
        this.token = null;
        this.user = null;
        localStorage.removeItem('flexjobs_token');
        localStorage.removeItem('flexjobs_user');
        
        // Update navbar immediately
        this.updateNavbar();
        
        // Also check for navbar elements periodically in case they weren't loaded yet
        this.checkNavbarElements();
        
        this.showAlert('You have been logged out', 'info');
        
        // Redirect to browse jobs page
        setTimeout(() => {
            window.location.href = 'browse-jobs.html';
        }, 1000);
    }

    updateNavbar() {
        const desktopNavbarAuth = document.getElementById('navbarAuth');
        const mobileNavbarAuth = document.getElementById('mobileNavbarAuth');
        
        console.log('Auth updateNavbar called:', {
            user: !!this.user,
            desktopElement: !!desktopNavbarAuth,
            mobileElement: !!mobileNavbarAuth
        });
        
        if (this.user) {
            // User is logged in - show account dropdown for desktop
            if (desktopNavbarAuth) {
                desktopNavbarAuth.innerHTML = `
                    <div class="dropdown">
                        <button class="main-header__account-btn dropdown-toggle" type="button" id="accountDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            My Account
                            <i class="fas fa-chevron-down ms-1"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                            <li><a class="dropdown-item" href="account.html">Account Details</a></li>
                            <li><a class="dropdown-item" href="faq.html">FAQs</a></li>
                            <li><a class="dropdown-item" href="support.html">Customer Support</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item logout-btn" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                        </ul>
                    </div>
                `;
            }

            // User is logged in - show account menu for mobile
            if (mobileNavbarAuth) {
                mobileNavbarAuth.innerHTML = `
                    <hr class="mobile-menu__divider">
                    <ul class="mobile-account-list">
                        <li class="mobile-account-item">
                            <a href="account.html" class="mobile-account-link">
                                Profile
                            </a>
                        </li>
                        <li class="mobile-account-item">
                            <a href="#" class="mobile-account-link">
                                Saved Jobs
                            </a>
                        </li>
                        <li class="mobile-account-item">
                            <a href="#" class="mobile-account-link">
                                Applications
                            </a>
                        </li>
                        <li class="mobile-account-item">
                            <a href="#" class="mobile-account-link logout-link logout-btn">
                                Logout
                            </a>
                        </li>
                    </ul>
                `;
            }
        } else {
            // User is logged out - show login/signup links for desktop
            if (desktopNavbarAuth) {
                desktopNavbarAuth.innerHTML = `
                    <div class="d-flex align-items-center gap-3">
                        <a href="registration.html" class="text-decoration-none text-white auth-link">Sign Up</a>
                        <a href="login.html" class="text-decoration-none text-white auth-link">Log In</a>
                    </div>
                `;
            }

            // User is logged out - show login/signup links for mobile
            if (mobileNavbarAuth) {
                mobileNavbarAuth.innerHTML = `
                    <hr class="mobile-menu__divider">
                    <ul class="mobile-account-list">
                        <li class="mobile-account-item">
                            <a href="registration.html" class="mobile-account-link" style="color:white;">
                                Sign Up
                            </a>
                        </li>
                        <li class="mobile-account-item">
                            <a href="login.html" class="mobile-account-link" style="color:white;">
                                Log In
                            </a>
                        </li>
                    </ul>
                `;
            }
        }

        // No need to re-initialize logout handlers here since they're set up once in init()
    }

    // Placeholder methods for dashboard features
    showDashboard() {
        this.showAlert('Dashboard feature coming soon!', 'info');
    }

    showProfile() {
        this.showAlert('Profile feature coming soon!', 'info');
    }

    showSavedJobs() {
        this.showAlert('Saved Jobs feature coming soon!', 'info');
    }

    showMyApplications() {
        this.showAlert('My Applications feature coming soon!', 'info');
    }

    showMyJobs() {
        this.showAlert('My Jobs feature coming soon!', 'info');
    }

    showPostJob() {
        this.showAlert('Post Job feature coming soon!', 'info');
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Loading...`;
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Helper method to get authorization headers
    getAuthHeaders() {
        return this.token ? {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Check if user is a specific type
    isJobSeeker() {
        return this.user && this.user.user_type === 'job_seeker';
    }

    isEmployer() {
        return this.user && this.user.user_type === 'employer';
    }

    isAdmin() {
        return this.user && this.user.user_type === 'admin';
    }

    // Setup logout event handlers
    setupLogoutHandlers() {
        // Only set up event listeners once
        if (this.logoutHandlersSetup) return;
        
        // Use event delegation to handle dynamically added logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn') || e.target.matches('.logout-link')) {
                e.preventDefault();
                this.logout();
            }
        });
        
        this.logoutHandlersSetup = true;
    }
    
    // Check if navbar elements exist and update if needed
    checkNavbarElements() {
        const checkInterval = setInterval(() => {
            const desktopAuth = document.getElementById('navbarAuth');
            const mobileAuth = document.getElementById('mobileNavbarAuth');
            
            if (desktopAuth || mobileAuth) {
                this.updateNavbar();
                clearInterval(checkInterval);
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
    }
}

// Initialize auth when DOM is loaded
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
    // Make auth globally available
    window.auth = auth;
});
