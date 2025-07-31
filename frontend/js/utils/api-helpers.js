// API Helper Utilities for Job-related requests
// Provides consistent API calling patterns across all pages

class JobAPI {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // Get authentication headers if user is logged in
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { ...this.defaultHeaders };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Generic API request handler with error handling
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return { success: true, data, status: response.status };
        } catch (error) {
            console.error('API Request Error:', error);
            return { success: false, error: error.message, data: null };
        }
    }

    // Get jobs with filtering and pagination
    async getJobs(filters = {}) {
        const queryParams = new URLSearchParams();
        
        // Add pagination
        queryParams.append('page', filters.page || 1);
        queryParams.append('limit', filters.limit || 12);
        
        // Add filters
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.job_type) queryParams.append('job_type', filters.job_type);
        if (filters.remote_type) queryParams.append('remote_type', filters.remote_type);
        if (filters.experience_level) queryParams.append('experience_level', filters.experience_level);
        if (filters.category_id) queryParams.append('category_id', filters.category_id);
        if (filters.salary_min) queryParams.append('salary_min', filters.salary_min);
        if (filters.salary_max) queryParams.append('salary_max', filters.salary_max);
        if (filters.is_featured !== undefined) queryParams.append('is_featured', filters.is_featured);
        if (filters.exclude) queryParams.append('exclude', filters.exclude);

        return this.request(`/jobs?${queryParams.toString()}`);
    }

    // Get featured jobs for homepage
    async getFeaturedJobs(limit = 6) {
        return this.getJobs({ 
            is_featured: true, 
            limit: limit 
        });
    }

    // Get recent jobs for general display
    async getRecentJobs(limit = 8) {
        return this.getJobs({ 
            limit: limit,
            sort: 'created_at'
        });
    }

    // Get single job by ID
    async getJob(jobId) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        return this.request(`/jobs/${jobId}`);
    }

    // Get similar jobs (used in job details page)
    async getSimilarJobs(jobId, categoryId, limit = 5) {
        const filters = {
            category_id: categoryId,
            exclude: jobId,
            limit: limit
        };

        return this.getJobs(filters);
    }

    // Get jobs by company
    async getJobsByCompany(companyId, page = 1, limit = 10) {
        return this.request(`/jobs/company/${companyId}?page=${page}&limit=${limit}`);
    }

    // Get job categories
    async getCategories() {
        return this.request('/jobs/categories');
    }

    // Search jobs with advanced filters
    async searchJobs(searchTerm, filters = {}) {
        return this.getJobs({
            search: searchTerm,
            ...filters
        });
    }

    // Apply to a job
    async applyToJob(jobId, applicationData) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        const formData = new FormData();
        formData.append('job_id', jobId);
        
        // Add text fields
        if (applicationData.name) formData.append('name', applicationData.name);
        if (applicationData.email) formData.append('email', applicationData.email);
        if (applicationData.cover_letter) formData.append('cover_letter', applicationData.cover_letter);
        
        // Add file if present
        if (applicationData.resume) {
            formData.append('resume', applicationData.resume);
        }

        return this.request('/applications', {
            method: 'POST',
            body: formData,
            headers: this.getAuthHeaders()
        });
    }

    // Save/unsave a job
    async toggleSaveJob(jobId) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        return this.request('/saved-jobs', {
            method: 'POST',
            body: JSON.stringify({ job_id: jobId })
        });
    }

    // Get saved jobs for current user
    async getSavedJobs(page = 1, limit = 10) {
        return this.request(`/saved-jobs?page=${page}&limit=${limit}`);
    }

    // Get application status for current user
    async getApplications(page = 1, limit = 10) {
        return this.request(`/applications?page=${page}&limit=${limit}`);
    }

    // Helper method to show user-friendly error messages
    static showError(error, defaultMessage = 'An error occurred') {
        const message = error || defaultMessage;
        
        // Try to show in existing alert system
        if (window.auth && typeof window.auth.showAlert === 'function') {
            window.auth.showAlert(message, 'danger');
        } else if (window.showAlert) {
            window.showAlert(message, 'danger');
        } else {
            // Fallback to console and simple alert
            console.error('API Error:', message);
            alert(message);
        }
    }

    // Helper method to show success messages  
    static showSuccess(message) {
        if (window.auth && typeof window.auth.showAlert === 'function') {
            window.auth.showAlert(message, 'success');
        } else if (window.showAlert) {
            window.showAlert(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }

    // Helper to check if user is logged in
    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    // Helper to redirect to login if needed
    static requireLogin(redirectUrl = null) {
        if (!this.isLoggedIn()) {
            if (redirectUrl) {
                localStorage.setItem('redirectAfterLogin', redirectUrl);
            } else {
                localStorage.setItem('redirectAfterLogin', window.location.href);
            }
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Helper to format API error responses
    static formatError(apiResponse) {
        if (!apiResponse || apiResponse.success) {
            return null;
        }

        // Handle validation errors
        if (apiResponse.data && apiResponse.data.errors) {
            return apiResponse.data.errors.map(err => err.msg).join(', ');
        }

        // Handle general errors
        return apiResponse.error || 'An unexpected error occurred';
    }

    // Helper to get user info from token
    static getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Helper to log API calls for debugging
    logRequest(endpoint, options, response) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.group('🔗 API Request');
            console.log('Endpoint:', endpoint);
            console.log('Options:', options);
            console.log('Response:', response);
            console.groupEnd();
        }
    }
}

// Create global instance
const jobAPI = new JobAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JobAPI, jobAPI };
}

// Make available globally
window.JobAPI = JobAPI;
window.jobAPI = jobAPI;
