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

        // Search inputs
        document.getElementById('userSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUsers();
        });
        
        document.getElementById('agentSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAgents();
        });
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
            this.renderDashboardStats(data);
            this.renderActivityFeed(data.recent_bookings);
            this.renderTopAgents(data.top_agents);
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
                                <h3 class="text-primary">${data.overview.total_users.toLocaleString()}</h3>
                                <small class="text-success">+${data.recent_activity.new_users_30d} this month</small>
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
                                <h3 class="text-success">${data.overview.total_agents.toLocaleString()}</h3>
                                <small class="text-muted">${data.agent_stats.verified_agents} verified</small>
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
                                <h3 class="text-warning">${data.overview.total_jobs.toLocaleString()}</h3>
                                <small class="text-success">+${data.recent_activity.new_jobs_30d} this month</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-briefcase fa-2x text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card revenue">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title text-muted">Monthly Revenue</h6>
                                <h3 class="text-danger">$${data.overview.monthly_revenue.toFixed(2)}</h3>
                                <small class="text-muted">${data.overview.active_subscriptions} subscriptions</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-dollar-sign fa-2x text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('statsCards').innerHTML = statsHtml;
    }

    renderActivityFeed(recentBookings) {
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
        
        document.getElementById('activityFeed').innerHTML = activityHtml || '<p class="text-muted">No recent activity</p>';
    }

    renderTopAgents(topAgents) {
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
        
        document.getElementById('topAgents').innerHTML = agentsHtml || '<p class="text-muted">No agents found</p>';
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
            this.renderUsersTable(data.users);
            this.renderPagination('users', data.pagination);
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
            this.renderAgentsTable(data.agents);
            this.renderPagination('agents', data.pagination);
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
                <td>${agent.agent_name}</td>
                <td>${agent.display_name}</td>
                <td>
                    <div class="rating-stars">${this.renderStars(agent.rating)}</div>
                    <small>(${agent.total_reviews})</small>
                </td>
                <td>$${agent.hourly_rate || 'N/A'}</td>
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
                    <div class="btn-group" role="group">
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

    // Placeholder methods for other sections
    loadJobs() {
        console.log('Load jobs - to be implemented');
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

function createAgent() {
    // TODO: Implement agent creation
    console.log('Create agent - to be implemented');
}

// Initialize dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});
