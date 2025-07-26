// Authentication functionality
class Auth {
    constructor() {
        this.token = localStorage.getItem('flexjobs_token');
        this.user = JSON.parse(localStorage.getItem('flexjobs_user') || 'null');
        this.init();
    }

    init() {
        this.updateNavbar();
        this.setupEventListeners();
        
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

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('flexjobs_token');
        localStorage.removeItem('flexjobs_user');
        this.updateNavbar();
        this.showAlert('You have been logged out', 'info');
    }

    updateNavbar() {
        const navbarAuth = document.getElementById('navbarAuth');
        if (!navbarAuth) return;

        if (this.user) {
            navbarAuth.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i>
                        ${this.user.first_name} ${this.user.last_name}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="auth.showDashboard()">
                            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="auth.showProfile()">
                            <i class="fas fa-user me-2"></i>Profile
                        </a></li>
                        ${this.user.user_type === 'job_seeker' ? `
                        <li><a class="dropdown-item" href="#" onclick="auth.showSavedJobs()">
                            <i class="fas fa-heart me-2"></i>Saved Jobs
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="auth.showMyApplications()">
                            <i class="fas fa-paper-plane me-2"></i>My Applications
                        </a></li>
                        ` : ''}
                        ${this.user.user_type === 'employer' ? `
                        <li><a class="dropdown-item" href="#" onclick="auth.showMyJobs()">
                            <i class="fas fa-briefcase me-2"></i>My Jobs
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="auth.showPostJob()">
                            <i class="fas fa-plus me-2"></i>Post Job
                        </a></li>
                        ` : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="auth.logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a></li>
                    </ul>
                </div>
            `;
        } else {
            navbarAuth.innerHTML = `
                <button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                    Login
                </button>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">
                    Sign Up
                </button>
            `;
        }
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
}

// Initialize auth when DOM is loaded
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
});
