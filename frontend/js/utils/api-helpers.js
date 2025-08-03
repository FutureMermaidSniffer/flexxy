


class JobAPI {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { ...this.defaultHeaders };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    
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

    
    async getJobs(filters = {}) {
        const queryParams = new URLSearchParams();
        
        
        queryParams.append('page', filters.page || 1);
        queryParams.append('limit', filters.limit || 12);
        
        
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

    
    async getFeaturedJobs(limit = 6) {
        return this.getJobs({ 
            is_featured: true, 
            limit: limit 
        });
    }

    
    async getRecentJobs(limit = 8) {
        return this.getJobs({ 
            limit: limit,
            sort: 'created_at'
        });
    }

    
    async getJob(jobId) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        return this.request(`/jobs/${jobId}`);
    }

    
    async getSimilarJobs(jobId, categoryId, limit = 5) {
        const filters = {
            category_id: categoryId,
            exclude: jobId,
            limit: limit
        };

        return this.getJobs(filters);
    }

    
    async getJobsByCompany(companyId, page = 1, limit = 10) {
        return this.request(`/jobs/company/${companyId}?page=${page}&limit=${limit}`);
    }

    
    async getCategories() {
        return this.request('/jobs/categories');
    }

    
    async searchJobs(searchTerm, filters = {}) {
        return this.getJobs({
            search: searchTerm,
            ...filters
        });
    }

    
    async applyToJob(jobId, applicationData) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        const formData = new FormData();
        formData.append('job_id', jobId);
        
        
        if (applicationData.name) formData.append('name', applicationData.name);
        if (applicationData.email) formData.append('email', applicationData.email);
        if (applicationData.cover_letter) formData.append('cover_letter', applicationData.cover_letter);
        
        
        if (applicationData.resume) {
            formData.append('resume', applicationData.resume);
        }

        return this.request('/applications', {
            method: 'POST',
            body: formData,
            headers: this.getAuthHeaders()
        });
    }

    
    async toggleSaveJob(jobId) {
        if (!jobId) {
            return { success: false, error: 'Job ID is required', data: null };
        }

        return this.request('/saved-jobs', {
            method: 'POST',
            body: JSON.stringify({ job_id: jobId })
        });
    }

    
    async getSavedJobs(page = 1, limit = 10) {
        return this.request(`/saved-jobs?page=${page}&limit=${limit}`);
    }

    
    async getApplications(page = 1, limit = 10) {
        return this.request(`/applications?page=${page}&limit=${limit}`);
    }

    
    static showError(error, defaultMessage = 'An error occurred') {
        const message = error || defaultMessage;
        
        
        if (window.auth && typeof window.auth.showAlert === 'function') {
            window.auth.showAlert(message, 'danger');
        } else if (window.showAlert) {
            window.showAlert(message, 'danger');
        } else {
            
            console.error('API Error:', message);
            alert(message);
        }
    }

    
    static showSuccess(message) {
        if (window.auth && typeof window.auth.showAlert === 'function') {
            window.auth.showAlert(message, 'success');
        } else if (window.showAlert) {
            window.showAlert(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }

    
    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    
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

    
    static formatError(apiResponse) {
        if (!apiResponse || apiResponse.success) {
            return null;
        }

        
        if (apiResponse.data && apiResponse.data.errors) {
            return apiResponse.data.errors.map(err => err.msg).join(', ');
        }

        
        return apiResponse.error || 'An unexpected error occurred';
    }

    
    static getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    
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


const jobAPI = new JobAPI();


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JobAPI, jobAPI };
}


window.JobAPI = JobAPI;
window.jobAPI = jobAPI;
