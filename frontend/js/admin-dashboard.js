

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = {
            users: 1,
            agents: 1,
            jobs: 1,
            profileForms: 1
        };
        this.pageSize = {
            users: 25,
            agents: 100,
            jobs: 10,
            profileForms: 25
        };
        this.filters = {
            users: {},
            agents: {},
            jobs: {},
            profileForms: {}
        };
        this.charts = { registrations: null, views: null };
        this.sectionTitles = {
            dashboard: 'Dashboard',
            users: 'Users',
            messages: 'Messages',
            'profile-forms': 'Profile Forms',
            agents: 'Agents',
            jobs: 'Jobs',
            analytics: 'Analytics'
        };
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.setupEventListeners();
        this.setupShell();
        const initial = this.parseLocationHash();
        if (initial.section && initial.section !== 'dashboard') {
            if (initial.page) this.currentPage[this.pageKey(initial.section)] = initial.page;
            if (initial.limit) this.pageSize[this.pageKey(initial.section)] = initial.limit;
            this.switchSection(initial.section);
        } else {
            this.loadDashboardStats();
        }
    }

    checkAdminAuth() {
        const token = localStorage.getItem('flexjobs_token');
        const user = JSON.parse(localStorage.getItem('flexjobs_user') || 'null');

        if (!token || !user || user.user_type !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/';
            return;
        }

        
        document.getElementById('adminName').textContent = `${user.first_name} ${user.last_name}`;
    }

    // Helper function to safely parse JSON with error handling
    safeJsonParse(jsonString, defaultValue = null) {
        if (!jsonString) return defaultValue;
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON parsing error:', error);
            return defaultValue;
        }
    }

    setupEventListeners() {
        
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section')
                    || e.target.closest('[data-section]')?.getAttribute('data-section');
                if (section) this.switchSection(section);
            });
        });

        
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action') || e.target.closest('[data-action]')?.getAttribute('data-action');
            if (!action) return;

            e.preventDefault();
            this.handleAction(action, e.target);
        });

        
        document.addEventListener('change', (e) => {
            const action = e.target.getAttribute('data-action');
            if (!action) return;

            this.handleAction(action, e.target);
        });

        
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            logout();
        });

        
        document.getElementById('userSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUsers();
        });

        document.getElementById('agentSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAgents();
        });
        
        document.getElementById('profileFormSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProfileForms();
        });
    }

    handleAction(action, element) {
        const actionType = element.getAttribute('data-action-type');
        
        switch(action) {
            case 'refresh-dashboard':
                refreshDashboard();
                break;
            case 'search-users':
                this.searchUsers();
                break;
            case 'open-add-admin':
                this.openAddAdminModal();
                break;
            case 'create-admin':
                this.createAdmin();
                break;
            case 'refresh-analytics':
                this.loadAnalytics();
                break;
            case 'search-profile-forms':
                this.searchProfileForms();
                break;
            case 'filter-profile-forms':
                this.filterProfileForms();
                break;
            case 'export-profile-forms':
                this.exportProfileForms();
                break;
            case 'search-agents':
                this.searchAgents();
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
                this.filterUsers();
                break;
            case 'filter-agents':
                this.filterAgents();
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
        const bar = document.getElementById('loadingOverlay');
        if (bar) bar.classList.add('is-on');
    }

    hideLoading() {
        const bar = document.getElementById('loadingOverlay');
        if (bar) bar.classList.remove('is-on');
    }

    escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    pageKey(section) {
        if (section === 'profile-forms') return 'profileForms';
        return section;
    }

    parseLocationHash() {
        const raw = (window.location.hash || '').replace(/^#/, '');
        if (!raw) return {};
        const [sectionPart, queryPart] = raw.split('?');
        const section = sectionPart || '';
        const params = new URLSearchParams(queryPart || '');
        const page = parseInt(params.get('page'), 10);
        const limit = parseInt(params.get('limit'), 10);
        return {
            section: this.sectionTitles[section] ? section : '',
            page: Number.isFinite(page) && page > 0 ? page : null,
            limit: Number.isFinite(limit) && limit > 0 ? Math.min(100, limit) : null
        };
    }

    writeLocationHash() {
        const section = this.currentSection || 'dashboard';
        const key = this.pageKey(section);
        const params = new URLSearchParams();
        if (this.currentPage[key] > 1) params.set('page', String(this.currentPage[key]));
        if (this.pageSize[key] && this.pageSize[key] !== 25 && section !== 'jobs') {
            params.set('limit', String(this.pageSize[key]));
        }
        const qs = params.toString();
        const next = qs ? `#${section}?${qs}` : `#${section}`;
        if (window.location.hash !== next) {
            history.replaceState(null, '', next);
        }
    }

    setupShell() {
        const shell = document.getElementById('adminShell');
        const menuBtn = document.getElementById('adminMenuBtn');
        const backdrop = document.getElementById('adminSidebarBackdrop');
        const closeNav = () => shell?.classList.remove('is-nav-open');
        menuBtn?.addEventListener('click', () => shell?.classList.toggle('is-nav-open'));
        backdrop?.addEventListener('click', closeNav);
        window.addEventListener('hashchange', () => {
            const loc = this.parseLocationHash();
            if (loc.section && loc.section !== this.currentSection) {
                if (loc.page) this.currentPage[this.pageKey(loc.section)] = loc.page;
                this.switchSection(loc.section);
            }
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-user-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-user-action');
            const id = parseInt(btn.getAttribute('data-user-id'), 10);
            if (!id) return;
            if (action === 'view') {
                this.viewWizardProgress(id, btn.getAttribute('data-user-name') || '');
            } else if (action === 'toggle') {
                this.toggleUserStatus(id, btn.getAttribute('data-user-active') === 'true');
            } else if (action === 'message') {
                if (this.adminChat) {
                    this.adminChat.startConversationWithUser(id, btn.getAttribute('data-user-name') || '');
                } else {
                    this.showAlert('Chat is not ready yet', 'warning');
                }
            }
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-agent-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-agent-action');
            const id = parseInt(btn.getAttribute('data-agent-id'), 10);
            if (action === 'delete') {
                const name = btn.getAttribute('data-agent-name') || '';
                this.deleteAgent(id || parseInt(document.getElementById('editAgentId')?.value, 10), name);
            }
        });
        document.addEventListener('change', (e) => {
            const select = e.target.closest('[data-page-size]');
            if (!select) return;
            const type = select.getAttribute('data-page-size');
            const limit = parseInt(select.value, 10);
            if (!type || !Number.isFinite(limit)) return;
            this.pageSize[this.pageKey(type)] = limit;
            this.currentPage[this.pageKey(type)] = 1;
            this.changePage(type, 1);
        });
    }

    showAlert(message, type = 'info') {
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertElement.style.cssText = 'top: 70px; right: 20px; z-index: 9999; min-width: 300px;';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertElement);
        
        
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }

    switchSection(section) {
        const navLink = document.querySelector(`[data-section="${section}"]`);
        if (!navLink || !document.getElementById(`${section}-section`)) return;

        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        navLink.classList.add('active');

        document.querySelectorAll('.content-section').forEach(sec => {
            sec.style.display = 'none';
        });

        const nextSection = document.getElementById(`${section}-section`);
        nextSection.style.display = section === 'messages' ? 'flex' : 'block';
        this.currentSection = section;
        const title = document.getElementById('adminPageTitle');
        if (title) title.textContent = this.sectionTitles[section] || 'Admin';
        const shell = document.getElementById('adminShell');
        shell?.classList.remove('is-nav-open');
        shell?.classList.toggle('is-messages', section === 'messages');
        this.writeLocationHash();

        switch (section) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'profile-forms':
                this.loadProfileForms();
                break;
            case 'agents':
                this.loadAgents();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'messages':
                this.adminChat?.activate();
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
            
            
            const statsData = data.data || data;
            
            this.renderDashboardStats(statsData);
            
            
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
            <div class="col-6 col-lg-3 mb-3">
                <div class="admin-stat">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>Total users</h6>
                            <h3>${(data.totalUsers || 0).toLocaleString()}</h3>
                            <small class="text-success">+${data.newUsers || 0} this month</small>
                        </div>
                        <span class="admin-stat-icon is-users"><i class="fas fa-users"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="admin-stat">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>Agents</h6>
                            <h3>${(data.totalAgents || 0).toLocaleString()}</h3>
                            <small class="text-muted">active consultants</small>
                        </div>
                        <span class="admin-stat-icon is-agents"><i class="fas fa-user-tie"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="admin-stat">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>Active jobs</h6>
                            <h3>${(data.activeJobs || 0).toLocaleString()}</h3>
                            <small class="text-muted">Total: ${data.totalJobs || 0}</small>
                        </div>
                        <span class="admin-stat-icon is-jobs"><i class="fas fa-briefcase"></i></span>
                    </div>
                </div>
            </div>
            <div class="col-6 col-lg-3 mb-3">
                <div class="admin-stat">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>Applications</h6>
                            <h3>${(data.totalApplications || 0).toLocaleString()}</h3>
                            <small class="text-muted">Companies: ${data.totalCompanies || 0}</small>
                        </div>
                        <span class="admin-stat-icon is-apps"><i class="fas fa-file-lines"></i></span>
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
            this.renderUsersSkeleton();

            const params = new URLSearchParams({
                page: String(this.currentPage.users),
                limit: String(this.pageSize.users || 25)
            });
            Object.entries(this.filters.users || {}).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    params.set(key, String(value).trim());
                }
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            this.renderUsersTable(data.data.users || []);
            this.renderPagination('users', data.data.pagination, 'users');
            this.writeLocationHash();
        } catch (error) {
            console.error('Load users error:', error);
            this.showAlert('Failed to load users', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderUsersSkeleton() {
        const row = `<tr class="admin-skeleton">${'<td><span class="admin-skel"></span></td>'.repeat(3)}</tr>`;
        const body = document.getElementById('usersTableBody');
        if (body) body.innerHTML = row.repeat(6);
        const cards = document.getElementById('usersCards');
        if (cards) {
            cards.innerHTML = '<div class="admin-user-card"><span class="admin-skel" style="width:60%"></span></div>'.repeat(3);
        }
    }

    currentAdminId() {
        try {
            const user = JSON.parse(localStorage.getItem('flexjobs_user') || 'null');
            return user?.id ? Number(user.id) : null;
        } catch {
            return null;
        }
    }

    parseClientMeta(meta) {
        if (!meta) return {};
        if (typeof meta === 'string') {
            try {
                return JSON.parse(meta) || {};
            } catch {
                return {};
            }
        }
        return typeof meta === 'object' ? meta : {};
    }

    formatUserLocation(user) {
        const parts = [user.last_city, user.last_region, user.last_country].filter(Boolean);
        return parts.length ? parts.join(', ') : '';
    }

    formatRelativeTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        const diff = Date.now() - d.getTime();
        const min = Math.round(diff / 60000);
        if (min < 1) return 'just now';
        if (min < 60) return `${min}m ago`;
        const hr = Math.round(min / 60);
        if (hr < 24) return `${hr}h ago`;
        const day = Math.round(hr / 24);
        if (day < 14) return `${day}d ago`;
        return d.toLocaleDateString();
    }

    deviceIcon(type) {
        if (type === 'mobile') return 'fa-mobile-screen-button';
        if (type === 'tablet') return 'fa-tablet-screen-button';
        if (type === 'desktop') return 'fa-desktop';
        return 'fa-circle-question';
    }

    renderUsersTable(users) {
        const body = document.getElementById('usersTableBody');
        const cards = document.getElementById('usersCards');

        if (!users.length) {
            if (body) {
                body.innerHTML = `<tr><td colspan="3">
                    <div class="admin-empty">
                        <div class="admin-empty-icon"><i class="fas fa-users"></i></div>
                        <h2 class="h6 mb-1">No users found</h2>
                        <p class="mb-0">Try a different search.</p>
                    </div>
                </td></tr>`;
            }
            if (cards) {
                cards.innerHTML = `<div class="admin-empty">
                    <div class="admin-empty-icon"><i class="fas fa-users"></i></div>
                    <h2 class="h6 mb-1">No users found</h2>
                    <p class="mb-0">Try a different search.</p>
                </div>`;
            }
            return;
        }

        const tableHtml = users.map(user => {
            const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—';
            const isAdmin = user.user_type === 'admin';
            return `
            <tr>
                <td class="text-nowrap">${user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                <td>
                    <button type="button" class="btn btn-link text-start text-decoration-none p-0 admin-user-info"
                            data-user-action="view" data-user-id="${user.id}"
                            data-user-name="${this.escapeHtml(name)}" title="View user">
                        <span class="admin-user-info-name">${this.escapeHtml(name)}${isAdmin ? ' <span class="badge bg-danger">admin</span>' : ''}</span>
                        <span class="admin-user-info-email">${this.escapeHtml(user.email || '')}</span>
                    </button>
                </td>
                <td class="text-end">
                    ${
                        isAdmin
                            ? '<span class="text-muted small">—</span>'
                            : `<button class="btn btn-sm btn-outline-primary py-0" type="button"
                                    data-user-action="message" data-user-id="${user.id}"
                                    data-user-name="${this.escapeHtml(name)}" title="Message user">
                                <i class="fas fa-comment me-1"></i>Message
                               </button>`
                    }
                </td>
            </tr>`;
        }).join('');

        const cardsHtml = users.map(user => {
            const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—';
            const isAdmin = user.user_type === 'admin';
            return `
            <article class="admin-user-card">
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <button type="button" class="btn btn-link text-start text-decoration-none p-0 admin-user-info"
                            data-user-action="view" data-user-id="${user.id}"
                            data-user-name="${this.escapeHtml(name)}">
                        <span class="admin-user-info-name">${this.escapeHtml(name)}</span>
                        <span class="admin-user-info-email">${this.escapeHtml(user.email || '')}</span>
                    </button>
                    ${
                        isAdmin
                            ? '<span class="badge bg-danger">admin</span>'
                            : `<button class="btn btn-sm btn-outline-primary py-0" type="button"
                                    data-user-action="message" data-user-id="${user.id}"
                                    data-user-name="${this.escapeHtml(name)}">Message</button>`
                    }
                </div>
            </article>`;
        }).join('');

        if (body) body.innerHTML = tableHtml;
        if (cards) cards.innerHTML = cardsHtml;
    }

    getUserTypeColor(userType) {
        const colors = {
            'job_seeker': 'primary',
            'employer': 'info',
            'admin': 'danger'
        };
        return colors[userType] || 'secondary';
    }

    renderWizardProgress(user) {
        // Simple status - just show what data exists
        return '<span class="badge bg-info">View Data</span>';
    }

    async viewWizardProgress(userId, userName) {
        try {
            this.showLoading();
            
            const response = await fetch(`/api/admin/users/${userId}/wizard-progress`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wizard progress');
            }

            const data = await response.json();
            this.showWizardProgressModal(userName, data.data);
        } catch (error) {
            console.error('View wizard progress error:', error);
            this.showAlert('Failed to load wizard progress', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    showWizardProgressModal(userName, wizardData) {
        const user = wizardData.user || {};
        const isSelf = this.currentAdminId() === Number(user.id);
        const isAdmin = user.user_type === 'admin';
        const modalHtml = `
            <div class="modal fade" id="wizardProgressModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header py-2">
                            <h5 class="modal-title">
                                <i class="fas fa-user me-2"></i>
                                ${this.escapeHtml(userName)}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${this.renderUserEditForm(user, isSelf)}
                            ${this.renderWizardProgressContent(wizardData)}
                        </div>
                        <div class="modal-footer py-2">
                            ${
                                !isAdmin
                                    ? `<button type="button" class="btn btn-outline-primary me-auto" data-user-action="message" data-user-id="${user.id}" data-user-name="${this.escapeHtml(userName)}">
                                        <i class="fas fa-comment me-1"></i>Message
                                       </button>`
                                    : '<span></span>'
                            }
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="saveUserDetailsBtn">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('wizardProgressModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('wizardProgressModal'));
        modal.show();
        
        document.getElementById('saveUserDetailsBtn')?.addEventListener('click', () => this.saveUserDetails(user.id));
        document.getElementById('wizardProgressModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    renderUserEditForm(user, isSelf) {
        const checked = (cond) => cond ? 'checked' : '';
        return `
            <form id="editUserForm" class="mb-3">
                <div class="row g-2">
                    <div class="col-md-6">
                        <label class="form-label small mb-1" for="editUserFirstName">First name</label>
                        <input class="form-control form-control-sm" id="editUserFirstName" value="${this.escapeHtml(user.first_name || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small mb-1" for="editUserLastName">Last name</label>
                        <input class="form-control form-control-sm" id="editUserLastName" value="${this.escapeHtml(user.last_name || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small mb-1" for="editUserEmail">Email</label>
                        <input type="email" class="form-control form-control-sm" id="editUserEmail" value="${this.escapeHtml(user.email || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small mb-1" for="editUserPhone">Phone</label>
                        <input class="form-control form-control-sm" id="editUserPhone" value="${this.escapeHtml(user.phone || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small mb-1" for="editUserLocation">Location</label>
                        <input class="form-control form-control-sm" id="editUserLocation" value="${this.escapeHtml(user.location || '')}">
                    </div>
                    <div class="col-md-6 d-flex align-items-end gap-3 pb-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editUserActive" ${checked(user.is_active)} ${isSelf ? 'disabled' : ''}>
                            <label class="form-check-label" for="editUserActive">Active</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editUserAdmin" data-original-type="${this.escapeHtml(user.user_type || 'job_seeker')}" ${checked(user.user_type === 'admin')} ${isSelf ? 'disabled' : ''}>
                            <label class="form-check-label" for="editUserAdmin">Make admin</label>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }

    async saveUserDetails(userId) {
        try {
            const adminBox = document.getElementById('editUserAdmin');
            const originalType = adminBox?.getAttribute('data-original-type') || 'job_seeker';
            const payload = {
                first_name: document.getElementById('editUserFirstName')?.value.trim(),
                last_name: document.getElementById('editUserLastName')?.value.trim(),
                email: document.getElementById('editUserEmail')?.value.trim(),
                phone: document.getElementById('editUserPhone')?.value.trim(),
                location: document.getElementById('editUserLocation')?.value.trim(),
                is_active: !!document.getElementById('editUserActive')?.checked,
                user_type: adminBox?.checked ? 'admin' : (originalType === 'admin' ? 'job_seeker' : originalType)
            };
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save user');
            }
            this.showAlert('User updated', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('wizardProgressModal'));
            modal?.hide();
            this.loadUsers();
        } catch (error) {
            this.showAlert(error.message || 'Failed to save user', 'danger');
        }
    }

    renderWizardProgressContent(wizardData) {
        const user = wizardData?.user || {};
        
        let content = '<div class="row g-4">';
        
        // Always show user info header
        const field = (label, value) => {
            if (value == null || value === '') return '';
            return `<div class="col-md-4 col-sm-6 mb-2"><div class="text-muted small">${label}</div><div>${value}</div></div>`;
        };
        content += `
            <div class="col-12">
                <div class="card">
                    <div class="card-header py-2">
                        <h6 class="card-title mb-0">All user information</h6>
                    </div>
                    <div class="card-body py-2">
                        <div class="row small">
                            ${field('ID', user.id)}
                            ${field('Type', this.escapeHtml(user.user_type || ''))}
                            ${field('Status', user.is_active ? 'Active' : 'Inactive')}
                            ${field('Email verified', user.email_verified ? 'Yes' : 'No')}
                            ${field('Phone', this.escapeHtml(user.phone || ''))}
                            ${field('Location', this.escapeHtml(user.location || ''))}
                            ${field('Experience', this.escapeHtml(user.experience_level || ''))}
                            ${field('LinkedIn', user.linkedin_url ? `<a href="${this.escapeHtml(user.linkedin_url)}" target="_blank" rel="noopener">${this.escapeHtml(user.linkedin_url)}</a>` : '')}
                            ${field('Portfolio', user.portfolio_url ? `<a href="${this.escapeHtml(user.portfolio_url)}" target="_blank" rel="noopener">${this.escapeHtml(user.portfolio_url)}</a>` : '')}
                            ${field('Created via wizard', user.created_via_wizard ? 'Yes' : 'No')}
                            ${field('Wizard completed', user.wizard_completed_at ? new Date(user.wizard_completed_at).toLocaleString() : '')}
                            ${field('Updated', user.updated_at ? new Date(user.updated_at).toLocaleString() : '')}
                            ${user.bio ? `<div class="col-12 mb-2"><div class="text-muted small">Bio</div><div>${this.escapeHtml(user.bio)}</div></div>` : ''}
                            ${user.skills ? `<div class="col-12 mb-2"><div class="text-muted small">Skills</div><div>${this.escapeHtml(typeof user.skills === 'string' ? user.skills : JSON.stringify(user.skills))}</div></div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        content += this.renderLastSeenLocationPanel(user);
        
        // Work Type Preferences
        if (user.work_type_preference) {
            const workType = this.safeJsonParse(user.work_type_preference);
            if (workType) {
                content += `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-briefcase me-2"></i>Work Type Preference
                                </h6>
                            </div>
                            <div class="card-body">
                                <span class="badge bg-primary fs-6">${this.formatWorkType(workType)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Salary Preferences
        if (user.salary_preference) {
            const salary = this.safeJsonParse(user.salary_preference);
            if (salary) {
                content += `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-dollar-sign me-2"></i>Salary Preference
                                </h6>
                            </div>
                            <div class="card-body">
                                <div><strong>Amount:</strong> ${this.formatSalary(salary)}</div>
                                <div><strong>Type:</strong> ${salary.type || 'Not specified'}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Location Preferences
        if (user.location_preference) {
            const location = this.safeJsonParse(user.location_preference);
            if (location) {
                content += `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-map-marker-alt me-2"></i>Location Preference
                                </h6>
                            </div>
                            <div class="card-body">
                                ${this.formatLocation(location)}
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Job Preferences
        if (user.job_preference) {
            const jobPref = this.safeJsonParse(user.job_preference);
            if (jobPref) {
                content += `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-search me-2"></i>Job Preferences
                                </h6>
                            </div>
                            <div class="card-body">
                                ${this.formatJobPreferences(jobPref)}
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Experience Level
        if (user.experience_level_preference) {
            content += `
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-chart-bar me-2"></i>Experience Level
                            </h6>
                        </div>
                        <div class="card-body">
                            <span class="badge bg-info fs-6">${user.experience_level_preference}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Education Level
        if (user.education_level_preference) {
            content += `
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-graduation-cap me-2"></i>Education Level
                            </h6>
                        </div>
                        <div class="card-body">
                            <span class="badge bg-success fs-6">${this.formatEducationLevel(user.education_level_preference)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Benefit Preferences
        if (user.benefit_preferences) {
            const benefits = this.safeJsonParse(user.benefit_preferences);
            if (benefits) {
                content += `
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-heart me-2"></i>Benefit Preferences
                                </h6>
                            </div>
                            <div class="card-body">
                                ${this.formatBenefits(benefits)}
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        content += '</div>';
        
        return content;
    }

    renderLastSeenLocationPanel(user) {
        const extra = this.parseClientMeta(user.last_client_metadata);
        const location = this.formatUserLocation(user) || 'Unknown';
        const lat = user.last_lat;
        const lng = user.last_lng;
        const hasCoords = lat != null && lng != null && lat !== '' && lng !== '';
        const mapHref = hasCoords
            ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=10/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`
            : '';
        const row = (label, value, extraClass = '') => {
            if (value == null || value === '') return '';
            return `<div class="col-md-6 mb-2"><div class="text-muted small">${label}</div><div class="${extraClass}">${value}</div></div>`;
        };
        const seen = user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : '';

        return `
            <div class="col-12">
                <div class="card admin-muted-card">
                    <div class="card-header">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-location-dot me-2"></i>Last seen location
                        </h6>
                    </div>
                    <div class="card-body admin-loc-panel">
                        <div class="row">
                            ${row('Location', this.escapeHtml(location))}
                            ${row('IP address', user.last_ip ? `<code>${this.escapeHtml(user.last_ip)}</code>` : '')}
                            ${hasCoords ? row('Coordinates', `${this.escapeHtml(String(lat))}, ${this.escapeHtml(String(lng))} ${mapHref ? `<a href="${this.escapeHtml(mapHref)}" target="_blank" rel="noopener">Map</a>` : ''}`) : ''}
                            ${row('Timezone', this.escapeHtml(extra.timezone || extra.ip_timezone || ''))}
                            ${row('Language', this.escapeHtml(extra.language || extra.languages || ''))}
                            ${row('Device', this.escapeHtml(user.last_device_type || ''))}
                            ${row('OS', this.escapeHtml(user.last_os || ''))}
                            ${row('Browser', this.escapeHtml(user.last_browser || extra.platform || ''))}
                            ${row('Screen', this.escapeHtml(extra.screen || ''))}
                            ${row('Network', this.escapeHtml(extra.org || ''))}
                            ${row('Last seen', this.escapeHtml(seen))}
                            ${user.last_user_agent ? `
                            <div class="col-12 mt-2">
                                <details>
                                    <summary class="text-muted small" style="cursor:pointer">Show user agent</summary>
                                    <div class="small text-break mt-1">${this.escapeHtml(user.last_user_agent)}</div>
                                </details>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatWorkType(workType) {
        const typeMap = {
            '100-remote': '100% Remote Work',
            'hybrid': 'Hybrid Remote Work',
            'flexible': 'Flexible/Open-minded'
        };
        return typeMap[workType] || workType;
    }

    formatSalary(salary) {
        if (salary.salary) {
            return `$${parseInt(salary.salary).toLocaleString()}`;
        }
        return 'Not specified';
    }

    formatLocation(location) {
        if (typeof location === 'string') {
            return location;
        }
        if (location.location) {
            return location.location;
        }
        return 'Not specified';
    }

    formatJobPreferences(jobPref) {
        if (jobPref.jobTitles && Array.isArray(jobPref.jobTitles)) {
            return jobPref.jobTitles.map(job => 
                `<span class="badge bg-secondary me-1 mb-1">${job}</span>`
            ).join('');
        }
        return 'No specific job titles';
    }

    formatEducationLevel(education) {
        const educationMap = {
            'high-school': 'High School or GED',
            'associates': "Associate's Degree",
            'bachelors': "Bachelor's Degree",
            'masters': "Master's or Higher",
            'specialized': 'Specialized/Other',
            'prefer-not': 'Prefer Not to Answer'
        };
        return educationMap[education] || education;
    }

    formatBenefits(benefits) {
        if (Array.isArray(benefits)) {
            return benefits.map(benefit => 
                `<span class="badge bg-primary me-1 mb-1">${benefit}</span>`
            ).join('');
        }
        return 'No specific benefits selected';
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
            this.loadUsers(); 
        } catch (error) {
            console.error('Toggle user status error:', error);
            this.showAlert('Failed to toggle user status', 'danger');
        }
    }

    async loadProfileForms() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: String(this.currentPage.profileForms || 1),
                limit: String(this.pageSize.profileForms || 25)
            });
            Object.entries(this.filters.profileForms || {}).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    params.set(key, String(value).trim());
                }
            });

            const response = await fetch(`/api/admin/profile-forms?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile forms');
            }

            const data = await response.json();
            this.renderProfileFormsTable(data.data.forms);
            this.renderPagination('profile-forms', data.data.pagination, 'submissions');
            this.loadProfileFormAgents(); // Load agents for filter dropdown
        } catch (error) {
            console.error('Load profile forms error:', error);
            this.showAlert('Failed to load profile forms', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    async loadProfileFormAgents() {
        try {
            const response = await fetch('/api/agents?limit=100', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                const agentFilter = document.getElementById('profileFormAgentFilter');
                if (agentFilter && data.agents) {
                    agentFilter.innerHTML = '<option value="">All Agents</option>' +
                        data.agents.map(agent => 
                            `<option value="${agent.id}">${agent.agent_name} - ${agent.display_name}</option>`
                        ).join('');
                }
            }
        } catch (error) {
            console.error('Error loading agents for filter:', error);
        }
    }

    renderProfileFormsTable(forms) {
        const body = document.getElementById('profileFormsTableBody');
        if (!body) return;
        if (!forms.length) {
            body.innerHTML = `<tr><td colspan="4">
                <div class="admin-empty">
                    <div class="admin-empty-icon"><i class="fas fa-user-pen"></i></div>
                    <h2 class="h6 mb-1">No profile forms found</h2>
                    <p class="mb-0">Try a different search or filter.</p>
                </div>
            </td></tr>`;
            return;
        }
        const tableHtml = forms.map(form => {
            const name = `${form.first_name || ''} ${form.last_name || ''}`.trim() || '—';
            return `
            <tr>
                <td>
                    <button type="button" class="btn btn-link text-start text-decoration-none p-0 admin-user-info"
                            onclick="adminDashboard.viewProfileFormDetails(${form.id})">
                        <span class="admin-user-info-name">${this.escapeHtml(name)}</span>
                        <span class="admin-user-info-email">${this.escapeHtml(form.email || '')}</span>
                    </button>
                </td>
                <td class="text-nowrap">${this.escapeHtml(form.phone || '—')}</td>
                <td>${this.escapeHtml(form.location || '—')}</td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary py-0" type="button"
                            onclick="adminDashboard.viewProfileFormDetails(${form.id})" title="View details">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                </td>
            </tr>`;
        }).join('');

        body.innerHTML = tableHtml;
    }

    getExperienceColor(level) {
        const colors = {
            'entry': 'success',
            'mid': 'primary',
            'senior': 'warning',
            'executive': 'danger'
        };
        return colors[level] || 'secondary';
    }

    async viewProfileFormDetails(submissionId) {
        try {
            const response = await fetch(`/api/admin/profile-forms/${submissionId}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile form details');
            }

            const submission = await response.json();
            this.showProfileFormModal(submission);
        } catch (error) {
            console.error('Error fetching profile form details:', error);
            this.showAlert('Failed to load profile form details', 'danger');
        }
    }

    showProfileFormModal(submission) {
        let jobPreference = submission.job_preference_parsed || null;
        if (!jobPreference && submission.job_preference) {
            try {
                jobPreference = typeof submission.job_preference === 'string'
                    ? JSON.parse(submission.job_preference)
                    : submission.job_preference;
            } catch (error) {
                console.error('Error parsing job preference:', error);
            }
        }

        const employment = Array.isArray(jobPreference?.employment_types)
            ? jobPreference.employment_types.join(', ')
            : (jobPreference?.employment_types || 'Not specified');
        const name = `${submission.first_name || ''} ${submission.last_name || ''}`.trim();
        const submitted = submission.created_at
            ? new Date(submission.created_at).toLocaleString()
            : 'Not provided';
        const resumeHref = submission.resume_path
            ? this.escapeHtml(submission.resume_path)
            : '';

        const modalHtml = `
            <div class="modal fade" id="profileFormModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Profile Submission Details - ${this.escapeHtml(name)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Personal Information</h6>
                                    <p><strong>Name:</strong> ${this.escapeHtml(name)}</p>
                                    <p><strong>Email:</strong> ${this.escapeHtml(submission.email || '')}</p>
                                    <p><strong>Phone:</strong> ${this.escapeHtml(submission.phone || 'Not provided')}</p>
                                    <p><strong>Location:</strong> ${this.escapeHtml(submission.location || 'Not provided')}</p>
                                    <p><strong>Work Eligibility:</strong> ${this.escapeHtml(submission.work_eligibility || 'Not provided')}</p>
                                    <p><strong>Experience Level:</strong> ${this.escapeHtml(submission.experience_level || 'Not provided')}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Job Preferences</h6>
                                    <p><strong>Role Type:</strong> ${this.escapeHtml(jobPreference?.role_type || 'Not specified')}</p>
                                    <p><strong>Industry:</strong> ${this.escapeHtml(jobPreference?.industry || 'Not specified')}</p>
                                    <p><strong>Employment Types:</strong> ${this.escapeHtml(employment)}</p>
                                    <p><strong>Selected Agent:</strong> ${this.escapeHtml(submission.agent_name || submission.agent_display_name || 'None')}</p>
                                    <p><strong>Resume:</strong> ${
                                        resumeHref
                                            ? `<a href="${resumeHref}" target="_blank" rel="noopener">Open resume</a>`
                                            : 'None'
                                    }</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6>Submission Details</h6>
                                    <p><strong>Status:</strong> <span class="badge bg-${submission.status === 'pending' ? 'warning' : submission.status === 'reviewed' ? 'success' : 'secondary'}">${this.escapeHtml(submission.status || 'pending')}</span></p>
                                    <p><strong>Submitted:</strong> ${this.escapeHtml(submitted)}</p>
                                    <p><strong>Data Processing Consent:</strong> ${submission.data_processing_consent ? 'Yes' : 'No'}</p>
                                    <p><strong>Job Alerts Consent:</strong> ${submission.job_alerts_consent ? 'Yes' : 'No'}</p>
                                    <p><strong>Marketing Consent:</strong> ${submission.marketing_consent ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            ${submission.bio ? `
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <h6>Additional Information</h6>
                                        <p>${this.escapeHtml(submission.bio)}</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="adminDashboard.exportSingleProfileForm(${submission.id})">
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('profileFormModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('profileFormModal'));
        modal.show();
    }

    async exportSingleProfileForm(userId) {
        try {
            const response = await fetch(`/api/admin/profile-forms/export?user=${userId}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to export profile form');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `profile-form-${userId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            this.showAlert('Failed to export profile form', 'danger');
        }
    }

    async loadAgents() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: String(this.currentPage.agents),
                limit: String(this.pageSize.agents || 25)
            });
            Object.entries(this.filters.agents || {}).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    params.set(key, String(value).trim());
                }
            });

            const response = await fetch(`/api/admin/agents?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch agents');
            }

            const data = await response.json();
            this.renderAgentsTable(data.data.agents);
            this.renderPagination('agents', data.data.pagination, 'agents');
        } catch (error) {
            console.error('Load agents error:', error);
            this.showAlert('Failed to load agents', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    agentList(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value.filter(Boolean);
        return String(value).split(',').map((s) => s.trim()).filter(Boolean);
    }

    renderAgentsTable(agents) {
        const body = document.getElementById('agentsTableBody');
        if (!body) return;
        if (!agents || !agents.length) {
            body.innerHTML = `<tr><td colspan="4">
                <div class="admin-empty">
                    <div class="admin-empty-icon"><i class="fas fa-user-tie"></i></div>
                    <h2 class="h6 mb-1">No agents found</h2>
                    <p class="mb-0">Try a different search or add an agent.</p>
                </div>
            </td></tr>`;
            return;
        }
        const tableHtml = agents.map(agent => {
            const name = agent.agent_name || agent.display_name || 'Agent';
            const display = agent.display_name && agent.display_name !== name ? agent.display_name : '';
            const initial = name.charAt(0).toUpperCase();
            const avatar = agent.avatar_url
                ? `<img src="${this.escapeHtml(agent.avatar_url)}" alt="" class="rounded-circle" width="36" height="36" style="object-fit:cover">`
                : `<span class="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-semibold" style="width:36px;height:36px;font-size:0.85rem">${this.escapeHtml(initial)}</span>`;
            return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${avatar}
                        <button type="button" class="btn btn-link text-start text-decoration-none p-0 admin-user-info"
                                onclick="adminDashboard.editAgent(${agent.id})">
                            <span class="admin-user-info-name">${this.escapeHtml(name)}</span>
                            ${display ? `<span class="admin-user-info-email">${this.escapeHtml(display)}</span>` : ''}
                        </button>
                    </div>
                </td>
                <td class="text-nowrap">${this.escapeHtml(agent.email || '—')}</td>
                <td>${this.escapeHtml(agent.location || '—')}</td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary py-0" type="button"
                            onclick="adminDashboard.editAgent(${agent.id})" title="Edit agent">
                        <i class="fas fa-edit me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-0" type="button"
                            data-agent-action="delete"
                            data-agent-id="${agent.id}"
                            data-agent-name="${this.escapeHtml(name)}"
                            title="Delete agent">
                        <i class="fas fa-trash me-1"></i>Delete
                    </button>
                </td>
            </tr>`;
        }).join('');

        body.innerHTML = tableHtml;
    }

    async deleteAgent(agentId, agentName = '') {
        const id = parseInt(agentId, 10);
        if (!id) return;
        const name = agentName || document.getElementById('editAgentName')?.value || 'this agent';
        if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

        try {
            this.showLoading();
            const response = await fetch(`/api/admin/agents/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete agent');
            }
            const modalEl = document.getElementById('editAgentModal');
            const modal = modalEl && typeof bootstrap !== 'undefined' ? bootstrap.Modal.getInstance(modalEl) : null;
            modal?.hide();
            this.showAlert(data.message || 'Agent deleted', 'success');
            this.loadAgents();
        } catch (error) {
            console.error('Delete agent error:', error);
            this.showAlert(error.message || 'Failed to delete agent', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    async toggleAgentFeatured(agentId, currentStatus) {
        try {
            const response = await fetch(`/api/admin/agents/${agentId}/toggle-featured`, {
                method: 'POST',
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

    renderPagination(type, pagination, noun = 'results') {
        const containerId = type === 'profile-forms' ? 'profileFormsPagination' : `${type}Pagination`;
        const container = document.getElementById(containerId);
        if (!container) return;

        const page = pagination?.page || 1;
        const limit = pagination?.limit || this.pageSize[this.pageKey(type)] || 25;
        const total = pagination?.total || 0;
        const totalPages = pagination?.totalPages ?? pagination?.pages ?? (limit ? Math.ceil(total / limit) : 0);
        const hasNext = pagination?.hasNext ?? (totalPages > 0 && page < totalPages);
        const hasPrev = pagination?.hasPrev ?? page > 1;
        const from = total === 0 ? 0 : (page - 1) * limit + 1;
        const to = Math.min(total, page * limit);
        const sizes = [10, 25, 50, 100];
        const currentLimit = this.pageSize[this.pageKey(type)] || limit;

        const pageBtn = (p, label, disabled = false, active = false) => `
            <li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">
                <a class="page-link" href="#" data-page-nav="${type}" data-page="${p}">${label}</a>
            </li>
        `;

        const pages = [];
        if (totalPages > 0) {
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            if (startPage > 1) {
                pages.push(pageBtn(1, '1'));
                if (startPage > 2) pages.push(`<li class="page-item disabled"><span class="page-link">…</span></li>`);
            }
            for (let i = startPage; i <= endPage; i++) {
                pages.push(pageBtn(i, String(i), false, i === page));
            }
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push(`<li class="page-item disabled"><span class="page-link">…</span></li>`);
                pages.push(pageBtn(totalPages, String(totalPages)));
            }
        }

        container.innerHTML = `
            <div class="admin-pager-meta">
                Showing <strong>${from}–${to}</strong> of <strong>${total}</strong> ${this.escapeHtml(noun)}
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
                <select class="form-select form-select-sm" data-page-size="${type}" aria-label="Rows per page" style="width:auto;min-height:40px">
                    ${sizes.map(s => `<option value="${s}" ${s === currentLimit ? 'selected' : ''}>${s} / page</option>`).join('')}
                </select>
                <nav aria-label="Pagination">
                    <ul class="pagination pagination-sm mb-0">
                        ${pageBtn(1, '&laquo;', !hasPrev)}
                        ${pageBtn(page - 1, 'Prev', !hasPrev)}
                        ${pages.join('')}
                        ${pageBtn(page + 1, 'Next', !hasNext)}
                        ${pageBtn(totalPages || 1, '&raquo;', !hasNext)}
                    </ul>
                </nav>
            </div>
        `;

        container.querySelectorAll('[data-page-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const next = parseInt(link.getAttribute('data-page'), 10);
                const disabled = link.closest('.page-item')?.classList.contains('disabled');
                if (disabled || !Number.isFinite(next)) return;
                this.changePage(type, next);
            });
        });
    }

    changePage(type, page) {
        if (page < 1) return;
        const key = this.pageKey(type);
        this.currentPage[key] = page;

        switch (type) {
            case 'users':
                this.loadUsers();
                break;
            case 'profile-forms':
                this.loadProfileForms();
                break;
            case 'agents':
                this.loadAgents();
                break;
            case 'jobs':
                this.loadJobs(page);
                break;
        }
    }

    searchUsers() {
        const search = document.getElementById('userSearch')?.value.trim() || '';
        this.filters.users = { search };
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
        this.searchUsers();
    }

    searchProfileForms() {
        const searchTerm = document.getElementById('profileFormSearch').value.trim();
        this.filters.profileForms = { 
            ...this.filters.profileForms,
            search: searchTerm 
        };
        this.currentPage.profileForms = 1;
        this.loadProfileForms();
    }

    filterProfileForms() {
        const agent = document.getElementById('profileFormAgentFilter')?.value || '';
        const completion = document.getElementById('profileFormCompletionFilter')?.value || '';
        const date = document.getElementById('profileFormDateFilter')?.value || '';
        const sort = document.getElementById('profileFormSort')?.value || 'newest';
        const search = document.getElementById('profileFormSearch')?.value.trim() || '';

        this.filters.profileForms = {
            ...this.filters.profileForms,
            search,
            agent,
            completion,
            date,
            sort
        };
        this.currentPage.profileForms = 1;
        this.loadProfileForms();
    }

    async exportProfileForms() {
        try {
            const params = new URLSearchParams(this.filters.profileForms || {});
            const response = await fetch(`/api/admin/profile-forms/export?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to export profile forms');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'profile-forms.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.showAlert('Profile forms exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showAlert('Failed to export profile forms', 'danger');
        }
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
        
        
        if (pagination.page > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="adminDashboard.loadJobs(${pagination.page - 1})">Previous</a>
                </li>
            `;
        }

        
        for (let i = Math.max(1, pagination.page - 2); i <= Math.min(pagination.pages, pagination.page + 2); i++) {
            paginationHtml += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="adminDashboard.loadJobs(${i})">${i}</a>
                </li>
            `;
        }

        
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

    formatGrowth(percent) {
        const n = Number(percent) || 0;
        const cls = n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-flat';
        const sign = n > 0 ? '+' : '';
        return `<span class="admin-growth ${cls}">${sign}${n}%</span>`;
    }

    async loadAnalytics() {
        try {
            this.showLoading();
            const range = document.getElementById('analyticsRange')?.value || '30d';
            const location = document.getElementById('analyticsLocation')?.value || '';
            const params = new URLSearchParams({ range });
            if (location) params.set('location', location);

            const response = await fetch(`/api/admin/analytics?${params}`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const payload = await response.json();
            const data = payload.data || {};

            const locSelect = document.getElementById('analyticsLocation');
            if (locSelect) {
                const current = locSelect.value;
                const options = ['<option value="">All locations</option>']
                    .concat((data.views?.locations || []).map((loc) => {
                        const sel = loc === current ? 'selected' : '';
                        return `<option value="${this.escapeHtml(loc)}" ${sel}>${this.escapeHtml(loc)}</option>`;
                    }));
                locSelect.innerHTML = options.join('');
            }

            const kpis = document.getElementById('analyticsKpis');
            if (kpis) {
                kpis.innerHTML = `
                    <div class="col-md-4">
                        <div class="admin-stat">
                            <h6>New registrations</h6>
                            <h3>${data.registrations?.total ?? 0}</h3>
                            <div>vs prior period ${this.formatGrowth(data.registrations?.growth_percent)}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="admin-stat">
                            <h6>Job views${location ? ` · ${this.escapeHtml(location)}` : ''}</h6>
                            <h3>${data.views?.total ?? 0}</h3>
                            <div class="text-muted small">Filter updates this chart</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="admin-stat">
                            <h6>Users by last-seen country</h6>
                            <h3>${data.users_by_location?.total ?? 0}</h3>
                            <div>vs prior period ${this.formatGrowth(data.users_by_location?.growth_percent)}</div>
                        </div>
                    </div>`;
            }

            this.renderRegistrationsChart(data.registrations?.series || []);
            this.renderViewsChart(data.views?.by_location || []);
        } catch (error) {
            console.error('Load analytics error:', error);
            this.showAlert('Failed to load analytics', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    renderRegistrationsChart(series) {
        const canvas = document.getElementById('registrationsChart');
        if (!canvas || typeof Chart === 'undefined') return;
        if (this.charts.registrations) this.charts.registrations.destroy();
        const points = (series || []).map((p) => ({
            day: p.day,
            count: Number(p.count) || 0
        }));
        const labels = points.map((p) => {
            const d = new Date(`${p.day}T00:00:00`);
            if (Number.isNaN(d.getTime())) return p.day;
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });
        const counts = points.map((p) => p.count);
        const peak = Math.max(0, ...counts);
        this.charts.registrations = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Registrations',
                    data: counts,
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.12)',
                    fill: true,
                    tension: 0.25,
                    cubicInterpolationMode: 'monotone',
                    pointRadius: peak > 0 ? 3 : 0,
                    pointHoverRadius: 5,
                    spanGaps: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: Math.max(1, peak),
                        ticks: { precision: 0, stepSize: peak <= 8 ? 1 : undefined }
                    }
                }
            }
        });
    }

    renderViewsChart(rows) {
        const canvas = document.getElementById('viewsLocationChart');
        if (!canvas || typeof Chart === 'undefined') return;
        if (this.charts.views) this.charts.views.destroy();
        this.charts.views = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: rows.map((r) => `${r.location} (${r.share_percent || 0}%)`),
                datasets: [{
                    label: 'Views',
                    data: rows.map((r) => r.views),
                    backgroundColor: '#0ea5e9'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    }

    async openAddAdminModal() {
        const modalEl = document.getElementById('addAdminModal');
        if (!modalEl) return;
        await this.loadAdminsList();
        new bootstrap.Modal(modalEl).show();
    }

    async loadAdminsList() {
        const list = document.getElementById('currentAdminsList');
        if (!list) return;
        try {
            const response = await fetch('/api/admin/admins', { headers: this.getAuthHeaders() });
            if (!response.ok) throw new Error('Failed to load admins');
            const data = await response.json();
            const admins = data.data?.admins || [];
            if (!admins.length) {
                list.textContent = 'No admins found.';
                return;
            }
            list.innerHTML = `<ul class="list-unstyled mb-0">${admins.map((a) =>
                `<li class="mb-1">${this.escapeHtml(`${a.first_name || ''} ${a.last_name || ''}`.trim())} <span class="text-muted">${this.escapeHtml(a.email || '')}</span></li>`
            ).join('')}</ul>`;
        } catch (error) {
            list.textContent = 'Could not load admins.';
        }
    }

    async createAdmin() {
        const first_name = document.getElementById('adminFirstName')?.value.trim();
        const last_name = document.getElementById('adminLastName')?.value.trim();
        const email = document.getElementById('adminEmail')?.value.trim();
        const password = document.getElementById('adminPassword')?.value;
        if (!first_name || !last_name || !email || !password) {
            this.showAlert('Fill in all admin fields', 'warning');
            return;
        }
        try {
            const response = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ first_name, last_name, email, password })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || 'Failed to create admin');
            this.showAlert(data.message || 'Admin created', 'success');
            document.getElementById('addAdminForm')?.reset();
            await this.loadAdminsList();
            if (this.currentSection === 'users') this.loadUsers();
        } catch (error) {
            this.showAlert(error.message || 'Failed to create admin', 'danger');
        }
    }

    async editAgent(agentId) {
        try {
            
            const response = await fetch(`/api/admin/agents/${agentId}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch agent details');
            }

            const agent = await response.json();

            
            document.getElementById('editAgentId').value = agent.id;
            document.getElementById('editAgentName').value = agent.agent_name || '';
            document.getElementById('editDisplayName').value = agent.display_name || '';
            document.getElementById('editAgentEmail').value = agent.email || '';
            document.getElementById('editAgentLocation').value = agent.location || '';
            document.getElementById('editTimezone').value = agent.timezone || '';
            document.getElementById('editAvatarUrl').value = agent.avatar_url || '';
            const editPreview = document.getElementById('editAgentImagePreview');
            const editFile = document.getElementById('editAgentImage');
            if (editFile) editFile.value = '';
            if (editPreview) {
                if (agent.avatar_url) {
                    editPreview.src = agent.avatar_url;
                    editPreview.classList.remove('d-none');
                } else {
                    editPreview.removeAttribute('src');
                    editPreview.classList.add('d-none');
                }
            }
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
            
            
            document.getElementById('editRating').value = `${agent.rating || '0.00'}/5.00`;
            document.getElementById('editTotalReviews').value = agent.total_reviews || 0;
            document.getElementById('editCreatedAt').value = this.formatDate(agent.created_at);

            
            new bootstrap.Modal(document.getElementById('editAgentModal')).show();
        } catch (error) {
            console.error('Edit agent error:', error);
            this.showAlert('Failed to load agent details', 'danger');
        }
    }
}


function refreshDashboard() {
    adminDashboard.loadDashboardStats();
}

function logout() {
    localStorage.removeItem('flexjobs_token');
    localStorage.removeItem('flexjobs_user');
    window.location.href = '/';
}

async function uploadAgentImageIfSelected(fileInputId, urlInputId) {
    const fileInput = document.getElementById(fileInputId);
    const file = fileInput?.files?.[0];
    if (!file) return document.getElementById(urlInputId)?.value || '';
    const body = new FormData();
    body.append('image', file);
    const response = await fetch('/api/upload/agent-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('flexjobs_token')}` },
        body
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || 'Failed to upload agent image');
    }
    const path = result.filePath || '';
    const hidden = document.getElementById(urlInputId);
    if (hidden) hidden.value = path;
    return path;
}

function previewAgentImage(fileInputId, previewId) {
    const input = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.classList.remove('d-none');
    });
}

previewAgentImage('agentImage', 'agentImagePreview');
previewAgentImage('editAgentImage', 'editAgentImagePreview');

async function createAgent() {
    try {
        const avatarUrl = await uploadAgentImageIfSelected('agentImage', 'avatarUrl');
        const formData = {
            agent_name: document.getElementById('agentName').value,
            display_name: document.getElementById('displayName').value,
            email: document.getElementById('agentEmail').value,
            location: document.getElementById('agentLocation').value,
            timezone: document.getElementById('timezone').value,
            avatar_url: avatarUrl,
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
            document.getElementById('avatarUrl').value = '';
            const preview = document.getElementById('agentImagePreview');
            if (preview) {
                preview.removeAttribute('src');
                preview.classList.add('d-none');
            }
            adminDashboard.loadAgents();
        } else {
            adminDashboard.showAlert(result.message || 'Failed to create agent', 'danger');
        }
    } catch (error) {
        console.error('Create agent error:', error);
        adminDashboard.showAlert('Failed to create agent', 'danger');
    }
}


async function updateAgent() {
    try {
        const agentId = document.getElementById('editAgentId').value;
        const avatarUrl = await uploadAgentImageIfSelected('editAgentImage', 'editAvatarUrl');
        const formData = {
            agent_name: document.getElementById('editAgentName').value,
            display_name: document.getElementById('editDisplayName').value,
            email: document.getElementById('editAgentEmail').value,
            location: document.getElementById('editAgentLocation').value,
            timezone: document.getElementById('editTimezone').value,
            avatar_url: avatarUrl,
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


let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
});
