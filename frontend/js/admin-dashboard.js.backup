/**
 * Admin Dashboard JavaScript
 * Handles all admin functionality including user management, agent management, and analytics
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = {
            users: 1,
            agents: 1,
            jobs: 1
        };
        this.filters = {
            users: {},
            agents: {},
            jobs: {}
        };
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.setupEventListeners();
        this.loadDashboardStats();
    }

    checkAdminAuth() {
        const token = localStorage.getItem('flexjobs_token');
        const user = JSON.parse(localStorage.getItem('flexjobs_user') || 'null');

        if (!token || !user || user.user_type !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }

        // Update admin name in navbar
        document.getElementById('adminName').textContent = `${user.first_name} ${user.last_name}`;
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('data-section'));
            });
        });

        // Global event delegation for data-action attributes
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action') || e.target.closest('[data-action]')?.getAttribute('data-action');
            if (!action) return;

            e.preventDefault();
            this.handleAction(action, e.target);
        });

        // Handle change events for filters and selects
        document.addEventListener('change', (e) => {
            const action = e.target.getAttribute('data-action');
            if (!action) return;

            this.handleAction(action, e.target);
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            logout();
        });

        // Search inputs
        document.getElementById('userSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUsers();
        });
        
        document.getElementById('agentSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAgents();
        });
    }

    handleAction(action, element) {
        const actionType = element.getAttribute('data-action-type');
        
        switch(action) {
            case 'refresh-dashboard':
                refreshDashboard();
                break;
            case 'search-users':
                searchUsers();
                break;
            case 'search-agents':
                searchAgents();
                break;
            case 'search-jobs':
                searchJobs();
                break;
            case 'filter-jobs':
                filterJobs();
                break;
            case 'sort-jobs':
                sortJobs();
                break;
            case 'export-jobs':
                exportJobs();
                break;
            case 'refresh-jobs':
                refreshJobs();
                break;
            case 'bulk-jobs':
                if (actionType) {
                    bulkActionJobs(actionType);
                }
                break;
            case 'bulk-delete-jobs':
                bulkDeleteJobs();
                break;
            case 'create-job':
                createJob();
                break;
            case 'save-job-draft':
                saveJobAsDraft();
                break;
            case 'update-job':
                updateJob();
                break;
            case 'edit-job-from-details':
                editJobFromDetails();
                break;
            case 'create-agent':
                createAgent();
                break;
            case 'update-agent':
                updateAgent();
                break;
            case 'filter-users':
                filterUsers();
                break;
            case 'filter-agents':
                filterAgents();
                break;
            case 'toggle-select-all-jobs':
                toggleSelectAllJobs();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('flexjobs_token')}`,
            'Content-Type': 'application/json'
        };
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertElement.style.cssText = 'top: 70px; right: 20px; z-index: 9999; min-width: 300px;';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }

    switchSection(section) {
        // Update sidebar active state
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${section}-section`).style.display = 'block';
        this.currentSection = section;

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'agents':
                this.loadAgents();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'subscriptions':
                this.loadSubscriptions();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    async loadDashboardStats() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/stats', {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            const data = await response.json();
            
            // Our API returns data in data.data, extract it
            const statsData = data.data || data;
            
            this.renderDashboardStats(statsData);
            
            // For now, show empty activity feed and top agents since we don't have this data yet
            this.renderActivityFeed([]);
            this.renderTopAgents([]);
        } catch (error) {
            console.error('Load dashboard stats error:', error);
            this.showAlert('Failed to load dashboard statistics', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderDashboardStats(data) {
        const statsHtml = `
            <div class="col-md-3">
                <div class="card stats-card users">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title text-muted">Total Users</h6>
                                <h3 class="text-primary">${(data.totalUsers || 0).toLocaleString()}</h3>
                                <small class="text-success">+${data.newUsers || 0} this month</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-users fa-2x text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card agents">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title text-muted">Active Agents</h6>
                                <h3 class="text-success">${(data.totalAgents || 0).toLocaleString()}</h3>
                                <small class="text-muted">${data.totalAgents || 0} total</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-user-tie fa-2x text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card jobs">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title text-muted">Active Jobs</h6>
                                <h3 class="text-warning">${(data.activeJobs || 0).toLocaleString()}</h3>
                                <small class="text-success">Total: ${data.totalJobs || 0}</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-briefcase fa-2x text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card applications">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title text-muted">Applications</h6>
                                <h3 class="text-info">${(data.totalApplications || 0).toLocaleString()}</h3>
                                <small class="text-muted">Companies: ${data.totalCompanies || 0}</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-file-alt fa-2x text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('statsCards').innerHTML = statsHtml;
    }

    renderActivityFeed(recentBookings = []) {
        if (!recentBookings || recentBookings.length === 0) {
            document.getElementById('activityFeed').innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }
        
        const activityHtml = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${booking.client_first_name} ${booking.client_last_name}</strong>
                        booked <em>${booking.agent_name}</em>
                        <div class="activity-time">${new Date(booking.scheduled_at).toLocaleDateString()}</div>
                    </div>
                    <span class="badge bg-${this.getStatusColor(booking.status)}">${booking.status}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('activityFeed').innerHTML = activityHtml;
    }

    renderTopAgents(topAgents = []) {
        if (!topAgents || topAgents.length === 0) {
            document.getElementById('topAgents').innerHTML = '<p class="text-muted">No agent data available</p>';
            return;
        }
        
        const agentsHtml = topAgents.map(agent => `
            <div class="d-flex align-items-center mb-3">
                <div class="agent-avatar bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i class="fas fa-user text-white"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${agent.display_name}</div>
                    <div class="rating-stars">
                        ${this.renderStars(agent.rating)}
                        <small class="text-muted">(${agent.total_reviews} reviews)</small>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('topAgents').innerHTML = agentsHtml;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHtml = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }
        
        return starsHtml;
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'confirmed': 'info',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    async loadUsers() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage.users,
                limit: 20,
                ...this.filters.users
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            this.renderUsersTable(data.data.users);
            this.renderPagination('users', data.data.pagination);
        } catch (error) {
            console.error('Load users error:', error);
            this.showAlert('Failed to load users', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderUsersTable(users) {
        const tableHtml = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-${this.getUserTypeColor(user.user_type)}">${user.user_type}</span>
                </td>
                <td>
                    <span class="badge bg-${user.is_active ? 'success' : 'danger'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-${user.is_active ? 'danger' : 'success'}" 
                            onclick="adminDashboard.toggleUserStatus(${user.id}, ${user.is_active})">
                        ${user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('usersTableBody').innerHTML = tableHtml;
    }

    getUserTypeColor(userType) {
        const colors = {
            'job_seeker': 'primary',
            'employer': 'info',
            'admin': 'danger'
        };
        return colors[userType] || 'secondary';
    }

    async toggleUserStatus(userId, currentStatus) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to toggle user status');
            }

            const data = await response.json();
            this.showAlert(data.message, 'success');
            this.loadUsers(); // Reload users table
        } catch (error) {
            console.error('Toggle user status error:', error);
            this.showAlert('Failed to toggle user status', 'danger');
        }
    }

    async loadAgents() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage.agents,
                limit: 20,
                ...this.filters.agents
            });

            const response = await fetch(`/api/admin/agents?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch agents');
            }

            const data = await response.json();
            this.renderAgentsTable(data.data.agents);
            this.renderPagination('agents', data.data.pagination);
        } catch (error) {
            console.error('Load agents error:', error);
            this.showAlert('Failed to load agents', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderAgentsTable(agents) {
        const tableHtml = agents.map(agent => `
            <tr>
                <td>${agent.id}</td>
                <td>
                    ${agent.avatar_url ? 
                        `<img src="${agent.avatar_url}" alt="Avatar" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">` : 
                        `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; color: white; font-weight: bold;">${agent.agent_name.charAt(0).toUpperCase()}</div>`
                    }
                </td>
                <td>
                    <div class="fw-bold">${agent.agent_name}</div>
                    <small class="text-muted">${agent.specializations ? agent.specializations.split(',').slice(0, 2).join(', ') : 'No specializations'}</small>
                </td>
                <td>
                    <div>${agent.display_name}</div>
                    ${agent.bio ? `<small class="text-muted">${agent.bio.length > 50 ? agent.bio.substring(0, 50) + '...' : agent.bio}</small>` : ''}
                </td>
                <td>
                    <div>${agent.email || 'N/A'}</div>
                    ${agent.linkedin_url ? `<a href="${agent.linkedin_url}" target="_blank" class="text-decoration-none"><i class="fab fa-linkedin"></i></a>` : ''}
                </td>
                <td>
                    <div>${agent.location || 'N/A'}</div>
                    ${agent.timezone ? `<small class="text-muted">${agent.timezone}</small>` : ''}
                </td>
                <td>
                    ${agent.specializations ? 
                        agent.specializations.split(',').slice(0, 3).map(spec => 
                            `<span class="badge bg-light text-dark me-1">${spec.trim()}</span>`
                        ).join('') : 
                        '<span class="text-muted">None</span>'
                    }
                </td>
                <td>
                    <div>${agent.experience_years || 0} years</div>
                    ${agent.languages ? `<small class="text-muted">${agent.languages.split(',').slice(0, 2).join(', ')}</small>` : ''}
                </td>
                <td>
                    <div class="rating-stars">${this.renderStars(agent.rating || 0)}</div>
                    <small class="text-muted">${agent.rating || '0.00'}/5.00</small>
                </td>
                <td>
                    <div>${agent.total_reviews || 0} reviews</div>
                    ${agent.certifications ? `<small class="text-success"><i class="fas fa-certificate"></i> Certified</small>` : ''}
                </td>
                <td>
                    <span class="badge bg-${agent.is_active ? 'success' : 'danger'}">
                        ${agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${agent.is_verified ? 'success' : 'warning'}">
                        ${agent.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${agent.is_featured ? 'info' : 'secondary'}">
                        ${agent.is_featured ? 'Featured' : 'Regular'}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${this.formatDate(agent.created_at)}</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="adminDashboard.editAgent(${agent.id})"
                                title="Edit Agent">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-${agent.is_verified ? 'warning' : 'success'}" 
                                onclick="adminDashboard.toggleAgentVerification(${agent.id}, ${agent.is_verified})"
                                title="Toggle Verification">
                            <i class="fas fa-${agent.is_verified ? 'times' : 'check'}"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-${agent.is_featured ? 'secondary' : 'info'}" 
                                onclick="adminDashboard.toggleAgentFeatured(${agent.id}, ${agent.is_featured})"
                                title="Toggle Featured">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('agentsTableBody').innerHTML = tableHtml;
    }

    async toggleAgentVerification(agentId, currentStatus) {
        try {
            const response = await fetch(`/api/admin/agents/${agentId}/toggle-verification`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to toggle agent verification');
            }

            const data = await response.json();
            this.showAlert(data.message, 'success');
            this.loadAgents();
        } catch (error) {
            console.error('Toggle agent verification error:', error);
            this.showAlert('Failed to toggle agent verification', 'danger');
        }
    }

    async toggleAgentFeatured(agentId, currentStatus) {
        try {
            const response = await fetch(`/api/admin/agents/${agentId}/toggle-featured`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to toggle agent featured status');
            }

            const data = await response.json();
            this.showAlert(data.message, 'success');
            this.loadAgents();
        } catch (error) {
            console.error('Toggle agent featured error:', error);
            this.showAlert('Failed to toggle agent featured status', 'danger');
        }
    }

    renderPagination(type, pagination) {
        const { page, totalPages, hasNext, hasPrev } = pagination;
        
        let paginationHtml = '<nav><ul class="pagination">';
        
        // Previous button
        paginationHtml += `
            <li class="page-item ${!hasPrev ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminDashboard.changePage('${type}', ${page - 1})">Previous</a>
            </li>
        `;
        
        // Page numbers (show max 5 pages)
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="adminDashboard.changePage('${type}', ${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHtml += `
            <li class="page-item ${!hasNext ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminDashboard.changePage('${type}', ${page + 1})">Next</a>
            </li>
        `;
        
        paginationHtml += '</ul></nav>';
        
        document.getElementById(`${type}Pagination`).innerHTML = paginationHtml;
    }

    changePage(type, page) {
        if (page < 1) return;
        
        this.currentPage[type] = page;
        
        switch (type) {
            case 'users':
                this.loadUsers();
                break;
            case 'agents':
                this.loadAgents();
                break;
            case 'jobs':
                this.loadJobs();
                break;
        }
    }

    searchUsers() {
        const search = document.getElementById('userSearch').value.trim();
        this.filters.users.search = search;
        this.currentPage.users = 1;
        this.loadUsers();
    }

    searchAgents() {
        const search = document.getElementById('agentSearch').value.trim();
        this.filters.agents.search = search;
        this.currentPage.agents = 1;
        this.loadAgents();
    }

    filterUsers() {
        const userType = document.getElementById('userTypeFilter').value;
        const isActive = document.getElementById('userStatusFilter').value;
        
        this.filters.users = { user_type: userType, is_active: isActive };
        this.currentPage.users = 1;
        this.loadUsers();
    }

    filterAgents() {
        const isVerified = document.getElementById('agentVerifiedFilter').value;
        const isFeatured = document.getElementById('agentFeaturedFilter').value;
        const isActive = document.getElementById('agentStatusFilter').value;
        
        this.filters.agents = { 
            is_verified: isVerified, 
            is_featured: isFeatured,
            is_active: isActive 
        };
        this.currentPage.agents = 1;
        this.loadAgents();
    }

    // Job Management Methods
    async loadJobs(page = 1) {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: page,
                limit: 10,
                ...this.filters.jobs
            });

            const response = await fetch(`/api/admin/jobs?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            this.renderJobsTable(data.data.jobs);
            this.renderJobsPagination(data.data.pagination);
            this.updateJobStats();
            
        } catch (error) {
            console.error('Load jobs error:', error);
            this.showAlert('Failed to load jobs', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderJobsTable(jobs) {
        const tbody = document.getElementById('jobsTableBody');
        
        if (!jobs || jobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <i class="fas fa-briefcase fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No jobs found</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addJobModal">
                            <i class="fas fa-plus me-2"></i>Add First Job
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        const jobsHtml = jobs.map(job => `
            <tr>
                <td>
                    <input type="checkbox" class="job-checkbox" value="${job.id}" onchange="updateBulkActions()">
                </td>
                <td>
                    <div class="fw-bold">${job.title}</div>
                    <small class="text-muted">${job.category || 'Uncategorized'}</small>
                </td>
                <td>${job.company_name}</td>
                <td>
                    <span class="badge bg-secondary">${this.formatJobType(job.job_type)}</span>
                </td>
                <td>
                    <div>${job.location}</div>
                    <small class="badge bg-info">${this.formatLocationType(job.location_type)}</small>
                </td>
                <td>
                    ${job.salary_min && job.salary_max ? 
                        `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : 
                        'Not specified'}
                </td>
                <td>
                    <span class="badge bg-${this.getJobStatusColor(job.status)}">${this.formatJobStatus(job.status)}</span>
                </td>
                <td>
                    <div>${new Date(job.created_at).toLocaleDateString()}</div>
                    <small class="text-muted">${this.getTimeAgo(job.created_at)}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${job.application_count || 0}</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewJobDetails(${job.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editJob(${job.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteJob(${job.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = jobsHtml;
    }

    renderJobsPagination(pagination) {
        const container = document.getElementById('jobsPagination');
        
        if (!pagination || pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHtml = '';
        
        // Previous page
        if (pagination.page > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="adminDashboard.loadJobs(${pagination.page - 1})">Previous</a>
                </li>
            `;
        }

        // Page numbers
        for (let i = Math.max(1, pagination.page - 2); i <= Math.min(pagination.pages, pagination.page + 2); i++) {
            paginationHtml += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="adminDashboard.loadJobs(${i})">${i}</a>
                </li>
            `;
        }

        // Next page
        if (pagination.page < pagination.pages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="adminDashboard.loadJobs(${pagination.page + 1})">Next</a>
                </li>
            `;
        }

        container.innerHTML = paginationHtml;
    }

    async updateJobStats() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                const stats = data.data;
                
                document.getElementById('totalJobsCount').textContent = stats.totalJobs || 0;
                document.getElementById('activeJobsCount').textContent = stats.activeJobs || 0;
                document.getElementById('pendingJobsCount').textContent = stats.pendingJobs || 0;
                document.getElementById('applicationsCount').textContent = stats.totalApplications || 0;
            }
        } catch (error) {
            console.error('Failed to update job stats:', error);
        }
    }

    formatJobType(type) {
        const types = {
            'full_time': 'Full Time',
            'part_time': 'Part Time',
            'contract': 'Contract',
            'freelance': 'Freelance',
            'internship': 'Internship'
        };
        return types[type] || type;
    }

    formatLocationType(type) {
        const types = {
            'remote': 'Remote',
            'hybrid': 'Hybrid',
            'onsite': 'On-site'
        };
        return types[type] || type;
    }

    formatJobStatus(status) {
        const statuses = {
            'draft': 'Draft',
            'pending': 'Pending',
            'active': 'Active',
            'closed': 'Closed'
        };
        return statuses[status] || status;
    }

    getJobStatusColor(status) {
        const colors = {
            'draft': 'secondary',
            'pending': 'warning',
            'active': 'success',
            'closed': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    searchJobs() {
        const searchTerm = document.getElementById('jobSearchInput').value;
        this.filters.jobs.search = searchTerm;
        this.currentPage.jobs = 1;
        this.loadJobs();
    }

    filterJobs() {
        const status = document.getElementById('jobStatusFilter').value;
        const type = document.getElementById('jobTypeFilter').value;
        const locationType = document.getElementById('locationTypeFilter').value;
        
        this.filters.jobs = { 
            status, 
            job_type: type, 
            location_type: locationType,
            search: document.getElementById('jobSearchInput').value
        };
        this.currentPage.jobs = 1;
        this.loadJobs();
    }

    sortJobs() {
        const sortBy = document.getElementById('jobSortBy').value;
        this.filters.jobs.sort = sortBy;
        this.loadJobs();
    }

    loadSubscriptions() {
        console.log('Load subscriptions - to be implemented');
    }

    loadAnalytics() {
        console.log('Load analytics - to be implemented');
    }
}

// Global functions
function refreshDashboard() {
    adminDashboard.loadDashboardStats();
}

function logout() {
    localStorage.removeItem('flexjobs_token');
    localStorage.removeItem('flexjobs_user');
    window.location.href = 'index.html';
}

async function createAgent() {
    try {
        const formData = {
            agent_name: document.getElementById('agentName').value,
            display_name: document.getElementById('displayName').value,
            email: document.getElementById('agentEmail').value,
            location: document.getElementById('agentLocation').value,
            timezone: document.getElementById('timezone').value,
            avatar_url: document.getElementById('avatarUrl').value,
            bio: document.getElementById('agentBio').value,
            experience_years: parseInt(document.getElementById('experienceYears').value) || 0,
            currency: document.getElementById('currency').value,
            specializations: document.getElementById('specializations').value,
            skills: document.getElementById('skills').value,
            languages: document.getElementById('languages').value,
            certifications: document.getElementById('certifications').value,
            linkedin_url: document.getElementById('linkedinUrl').value,
            portfolio_url: document.getElementById('portfolioUrl').value,
            is_active: document.getElementById('isActive').checked,
            is_featured: document.getElementById('isFeatured').checked,
            is_verified: document.getElementById('isVerified').checked
        };

        // Validate required fields
        if (!formData.agent_name || !formData.display_name || !formData.email) {
            adminDashboard.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const response = await fetch('/api/admin/agents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...adminDashboard.getAuthHeaders()
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            adminDashboard.showAlert('Agent created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addAgentModal')).hide();
            document.getElementById('addAgentForm').reset();
            adminDashboard.loadAgents();
        } else {
            adminDashboard.showAlert(result.message || 'Failed to create agent', 'danger');
        }
    } catch (error) {
        console.error('Create agent error:', error);
        adminDashboard.showAlert('Failed to create agent', 'danger');
    }
}

// Edit Agent Function
async function editAgent(agentId) {
    try {
        // Fetch agent details
        const response = await fetch(`/api/admin/agents/${agentId}`, {
            headers: adminDashboard.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch agent details');
        }

        const agent = await response.json();

        // Populate edit form
        document.getElementById('editAgentId').value = agent.id;
        document.getElementById('editAgentName').value = agent.agent_name || '';
        document.getElementById('editDisplayName').value = agent.display_name || '';
        document.getElementById('editAgentEmail').value = agent.email || '';
        document.getElementById('editAgentLocation').value = agent.location || '';
        document.getElementById('editTimezone').value = agent.timezone || '';
        document.getElementById('editAvatarUrl').value = agent.avatar_url || '';
        document.getElementById('editAgentBio').value = agent.bio || '';
        document.getElementById('editExperienceYears').value = agent.experience_years || 0;
        document.getElementById('editCurrency').value = agent.currency || 'USD';
        document.getElementById('editAgentStatus').value = agent.status || 'active';
        document.getElementById('editSpecializations').value = agent.specializations || '';
        document.getElementById('editSkills').value = agent.skills || '';
        document.getElementById('editLanguages').value = agent.languages || '';
        document.getElementById('editCertifications').value = agent.certifications || '';
        document.getElementById('editLinkedinUrl').value = agent.linkedin_url || '';
        document.getElementById('editPortfolioUrl').value = agent.portfolio_url || '';
        document.getElementById('editIsActive').checked = agent.is_active || false;
        document.getElementById('editIsFeatured').checked = agent.is_featured || false;
        document.getElementById('editIsVerified').checked = agent.is_verified || false;
        
        // Populate read-only fields
        document.getElementById('editRating').value = `${agent.rating || '0.00'}/5.00`;
        document.getElementById('editTotalReviews').value = agent.total_reviews || 0;
        document.getElementById('editCreatedAt').value = adminDashboard.formatDate(agent.created_at);

        // Show edit modal
        new bootstrap.Modal(document.getElementById('editAgentModal')).show();
    } catch (error) {
        console.error('Edit agent error:', error);
        adminDashboard.showAlert('Failed to load agent details', 'danger');
    }
}

// Update Agent Function
async function updateAgent() {
    try {
        const agentId = document.getElementById('editAgentId').value;
        const formData = {
            agent_name: document.getElementById('editAgentName').value,
            display_name: document.getElementById('editDisplayName').value,
            email: document.getElementById('editAgentEmail').value,
            location: document.getElementById('editAgentLocation').value,
            timezone: document.getElementById('editTimezone').value,
            avatar_url: document.getElementById('editAvatarUrl').value,
            bio: document.getElementById('editAgentBio').value,
            experience_years: parseInt(document.getElementById('editExperienceYears').value) || 0,
            currency: document.getElementById('editCurrency').value,
            specializations: document.getElementById('editSpecializations').value,
            skills: document.getElementById('editSkills').value,
            languages: document.getElementById('editLanguages').value,
            certifications: document.getElementById('editCertifications').value,
            linkedin_url: document.getElementById('editLinkedinUrl').value,
            portfolio_url: document.getElementById('editPortfolioUrl').value,
            is_active: document.getElementById('editIsActive').checked,
            is_featured: document.getElementById('editIsFeatured').checked,
            is_verified: document.getElementById('editIsVerified').checked
        };

        // Validate required fields
        if (!formData.agent_name || !formData.display_name || !formData.email) {
            adminDashboard.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const response = await fetch(`/api/admin/agents/${agentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...adminDashboard.getAuthHeaders()
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            adminDashboard.showAlert('Agent updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editAgentModal')).hide();
            adminDashboard.loadAgents();
        } else {
            adminDashboard.showAlert(result.message || 'Failed to update agent', 'danger');
        }
    } catch (error) {
        console.error('Update agent error:', error);
        adminDashboard.showAlert('Failed to update agent', 'danger');
    }
}

// Job Management Global Functions
function searchJobs() {
    adminDashboard.searchJobs();
}

function filterJobs() {
    adminDashboard.filterJobs();
}

function sortJobs() {
    adminDashboard.sortJobs();
}

function refreshJobs() {
    adminDashboard.loadJobs();
}

function toggleSelectAllJobs() {
    const selectAll = document.getElementById('selectAllJobs');
    const checkboxes = document.querySelectorAll('.job-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const selectedCheckboxes = document.querySelectorAll('.job-checkbox:checked');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectedCount = document.getElementById('selectedJobsCount');
    
    if (selectedCheckboxes.length > 0) {
        bulkActionsBar.style.display = 'block';
        selectedCount.textContent = `${selectedCheckboxes.length} job${selectedCheckboxes.length !== 1 ? 's' : ''} selected`;
    } else {
        bulkActionsBar.style.display = 'none';
    }
}

async function createJob() {
    try {
        const formData = {
            title: document.getElementById('jobTitle').value,
            company_name: document.getElementById('companyName').value,
            location: document.getElementById('jobLocation').value,
            job_type: document.getElementById('jobType').value,
            location_type: document.getElementById('locationType').value,
            category: document.getElementById('jobCategory').value,
            salary_min: document.getElementById('salaryMin').value || null,
            salary_max: document.getElementById('salaryMax').value || null,
            salary_type: document.getElementById('salaryType').value,
            description: document.getElementById('jobDescription').value,
            requirements: document.getElementById('jobRequirements').value,
            experience_level: document.getElementById('experienceLevel').value,
            application_deadline: document.getElementById('applicationDeadline').value || null,
            contact_email: document.getElementById('contactEmail').value,
            application_url: document.getElementById('applicationUrl').value,
            tags: document.getElementById('jobTags').value,
            is_featured: document.getElementById('isFeatured').checked,
            status: document.getElementById('jobStatus').value
        };

        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                ...adminDashboard.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            adminDashboard.showAlert('Job created successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addJobModal')).hide();
            document.getElementById('addJobForm').reset();
            adminDashboard.loadJobs();
        } else {
            const error = await response.json();
            adminDashboard.showAlert(error.message || 'Failed to create job', 'danger');
        }
    } catch (error) {
        console.error('Create job error:', error);
        adminDashboard.showAlert('Failed to create job', 'danger');
    }
}

async function saveJobAsDraft() {
    // Set status to draft and create
    document.getElementById('jobStatus').value = 'draft';
    await createJob();
}

async function viewJobDetails(jobId) {
    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            headers: adminDashboard.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            const job = data.data;
            
            document.getElementById('jobDetailsTitle').textContent = job.title;
            document.getElementById('jobDetailsContent').innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Basic Information</h6>
                        <p><strong>Company:</strong> ${job.company_name}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Type:</strong> ${adminDashboard.formatJobType(job.job_type)}</p>
                        <p><strong>Location Type:</strong> ${adminDashboard.formatLocationType(job.location_type)}</p>
                        <p><strong>Status:</strong> <span class="badge bg-${adminDashboard.getJobStatusColor(job.status)}">${adminDashboard.formatJobStatus(job.status)}</span></p>
                    </div>
                    <div class="col-md-6">
                        <h6>Additional Details</h6>
                        <p><strong>Category:</strong> ${job.category || 'Not specified'}</p>
                        <p><strong>Experience Level:</strong> ${job.experience_level || 'Not specified'}</p>
                        <p><strong>Salary:</strong> ${job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : 'Not specified'}</p>
                        <p><strong>Created:</strong> ${new Date(job.created_at).toLocaleDateString()}</p>
                        <p><strong>Applications:</strong> ${job.application_count || 0}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <h6>Description</h6>
                    <p>${job.description || 'No description provided'}</p>
                </div>
                ${job.requirements ? `
                    <div class="mt-3">
                        <h6>Requirements</h6>
                        <p>${job.requirements}</p>
                    </div>
                ` : ''}
                ${job.tags ? `
                    <div class="mt-3">
                        <h6>Tags</h6>
                        <p>${job.tags}</p>
                    </div>
                ` : ''}
            `;
            
            // Store job ID for edit functionality
            document.getElementById('jobDetailsModal').setAttribute('data-job-id', jobId);
            
            bootstrap.Modal.getOrCreateInstance(document.getElementById('jobDetailsModal')).show();
        } else {
            adminDashboard.showAlert('Failed to load job details', 'danger');
        }
    } catch (error) {
        console.error('View job details error:', error);
        adminDashboard.showAlert('Failed to load job details', 'danger');
    }
}

function editJobFromDetails() {
    const jobId = document.getElementById('jobDetailsModal').getAttribute('data-job-id');
    bootstrap.Modal.getInstance(document.getElementById('jobDetailsModal')).hide();
    editJob(jobId);
}

async function editJob(jobId) {
    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            headers: adminDashboard.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            const job = data.data;
            
            // Populate edit form
            document.getElementById('editJobId').value = job.id;
            document.getElementById('editJobTitle').value = job.title;
            document.getElementById('editJobStatus').value = job.status;
            
            bootstrap.Modal.getOrCreateInstance(document.getElementById('editJobModal')).show();
        } else {
            adminDashboard.showAlert('Failed to load job for editing', 'danger');
        }
    } catch (error) {
        console.error('Edit job error:', error);
        adminDashboard.showAlert('Failed to load job for editing', 'danger');
    }
}

async function updateJob() {
    try {
        const jobId = document.getElementById('editJobId').value;
        const formData = {
            title: document.getElementById('editJobTitle').value,
            status: document.getElementById('editJobStatus').value
            // Add other fields as needed
        };

        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                ...adminDashboard.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            adminDashboard.showAlert('Job updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editJobModal')).hide();
            adminDashboard.loadJobs();
        } else {
            const error = await response.json();
            adminDashboard.showAlert(error.message || 'Failed to update job', 'danger');
        }
    } catch (error) {
        console.error('Update job error:', error);
        adminDashboard.showAlert('Failed to update job', 'danger');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: adminDashboard.getAuthHeaders()
        });

        if (response.ok) {
            adminDashboard.showAlert('Job deleted successfully!', 'success');
            adminDashboard.loadJobs();
        } else {
            const error = await response.json();
            adminDashboard.showAlert(error.message || 'Failed to delete job', 'danger');
        }
    } catch (error) {
        console.error('Delete job error:', error);
        adminDashboard.showAlert('Failed to delete job', 'danger');
    }
}

async function bulkActionJobs(action) {
    const selectedCheckboxes = document.querySelectorAll('.job-checkbox:checked');
    const jobIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (jobIds.length === 0) {
        adminDashboard.showAlert('No jobs selected', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to ${action} ${jobIds.length} job(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/api/jobs/bulk-action', {
            method: 'POST',
            headers: {
                ...adminDashboard.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                job_ids: jobIds
            })
        });

        if (response.ok) {
            adminDashboard.showAlert(`${jobIds.length} job(s) updated successfully!`, 'success');
            adminDashboard.loadJobs();
            updateBulkActions();
        } else {
            const error = await response.json();
            adminDashboard.showAlert(error.message || 'Bulk action failed', 'danger');
        }
    } catch (error) {
        console.error('Bulk action error:', error);
        adminDashboard.showAlert('Bulk action failed', 'danger');
    }
}

async function bulkDeleteJobs() {
    const selectedCheckboxes = document.querySelectorAll('.job-checkbox:checked');
    const jobIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (jobIds.length === 0) {
        adminDashboard.showAlert('No jobs selected', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to DELETE ${jobIds.length} job(s)? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch('/api/jobs/bulk-delete', {
            method: 'POST',
            headers: {
                ...adminDashboard.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job_ids: jobIds
            })
        });

        if (response.ok) {
            adminDashboard.showAlert(`${jobIds.length} job(s) deleted successfully!`, 'success');
            adminDashboard.loadJobs();
            updateBulkActions();
        } else {
            const error = await response.json();
            adminDashboard.showAlert(error.message || 'Bulk delete failed', 'danger');
        }
    } catch (error) {
        console.error('Bulk delete error:', error);
        adminDashboard.showAlert('Bulk delete failed', 'danger');
    }
}

function exportJobs() {
    const searchParams = new URLSearchParams({
        export: 'csv',
        ...adminDashboard.filters.jobs
    });
    
    const exportUrl = `/api/admin/jobs/export?${searchParams}`;
    window.open(exportUrl, '_blank');
}

// Initialize dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});
