/**
 * Admin Messages panel for FlexJobs chat system.
 * Extends AdminDashboard prototype when available.
 */

(function () {
    const POLL_MS = 5000;

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        const now = new Date();
        const sameDay = d.toDateString() === now.toDateString();
        return sameDay
            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatLocation(meta) {
        if (!meta) return '—';
        const parts = [meta.location_city, meta.location_region, meta.location_country].filter(Boolean);
        return parts.length ? parts.join(', ') : '—';
    }

    class AdminChat {
        constructor(dashboard) {
            this.dashboard = dashboard;
            this.conversations = [];
            this.selectedId = null;
            this.lastMessageId = 0;
            this.pollTimer = null;
            this.filters = { status: '', search: '', participant: '' };
            this.page = 1;
        }

        getAuthHeaders() {
            return this.dashboard.getAuthHeaders();
        }

        startPolling() {
            this.stopPolling();
            this.pollTimer = setInterval(() => {
                if (this.dashboard.currentSection === 'messages') {
                    this.refreshQuiet();
                }
            }, POLL_MS);
        }

        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }

        async refreshQuiet() {
            try {
                await this.loadConversations({ silent: true });
                if (this.selectedId) {
                    await this.loadMessages(this.selectedId, { silent: true, incremental: true });
                }
                await this.updateUnreadBadge();
            } catch (e) {
                // ignore quiet poll errors
            }
        }

        async updateUnreadBadge() {
            try {
                const res = await fetch('/api/chat/admin/unread-count', {
                    headers: this.getAuthHeaders()
                });
                if (!res.ok) return;
                const data = await res.json();
                const total = data.data?.total || 0;
                const badge = document.getElementById('adminChatUnreadBadge');
                if (badge) {
                    if (total > 0) {
                        badge.textContent = total > 99 ? '99+' : String(total);
                        badge.classList.remove('d-none');
                    } else {
                        badge.classList.add('d-none');
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        async loadConversations(opts = {}) {
            const params = new URLSearchParams({
                page: String(this.page),
                limit: '30'
            });
            if (this.filters.status) params.set('status', this.filters.status);
            if (this.filters.search) params.set('search', this.filters.search);
            if (this.filters.participant) params.set('participant', this.filters.participant);

            if (!opts.silent) this.dashboard.showLoading();
            try {
                const res = await fetch(`/api/chat/admin/conversations?${params}`, {
                    headers: this.getAuthHeaders()
                });
                if (!res.ok) throw new Error('Failed to load conversations');
                const data = await res.json();
                this.conversations = data.data.conversations || [];
                this.renderConversationList();
                if (data.data.total_admin_unread != null) {
                    const badge = document.getElementById('adminChatUnreadBadge');
                    const total = data.data.total_admin_unread;
                    if (badge) {
                        if (total > 0) {
                            badge.textContent = total > 99 ? '99+' : String(total);
                            badge.classList.remove('d-none');
                        } else {
                            badge.classList.add('d-none');
                        }
                    }
                }
            } finally {
                if (!opts.silent) this.dashboard.hideLoading();
            }
        }

        renderConversationList() {
            const list = document.getElementById('adminChatConversationList');
            if (!list) return;

            if (!this.conversations.length) {
                list.innerHTML = `
                    <div class="text-center text-muted p-4">
                        <i class="fas fa-comments fa-2x mb-2 d-block opacity-50"></i>
                        No conversations yet
                    </div>`;
                return;
            }

            list.innerHTML = this.conversations
                .map((c) => {
                    const active = c.id === this.selectedId ? 'active' : '';
                    const unread =
                        c.admin_unread_count > 0
                            ? `<span class="badge bg-danger rounded-pill ms-1">${c.admin_unread_count}</span>`
                            : '';
                    const typeBadge = c.is_guest
                        ? '<span class="badge bg-secondary">Guest</span>'
                        : '<span class="badge bg-primary">User</span>';
                    const statusBadge =
                        c.status === 'closed'
                            ? '<span class="badge bg-light text-dark border">Closed</span>'
                            : '';
                    return `
                    <button type="button" class="list-group-item list-group-item-action admin-chat-item ${active}"
                            data-conversation-id="${c.id}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="me-2 text-start" style="min-width:0">
                                <div class="fw-semibold text-truncate">
                                    ${escapeHtml(c.display_name)} ${unread}
                                </div>
                                <div class="small text-muted text-truncate">
                                    ${escapeHtml(c.last_message_preview || 'No messages yet')}
                                </div>
                                <div class="mt-1 d-flex gap-1 flex-wrap">
                                    ${typeBadge} ${statusBadge}
                                </div>
                            </div>
                            <small class="text-muted text-nowrap">${formatTime(c.last_message_at || c.created_at)}</small>
                        </div>
                        ${c.user_email ? `<div class="small text-muted text-truncate mt-1">${escapeHtml(c.user_email)}</div>` : ''}
                    </button>`;
                })
                .join('');

            list.querySelectorAll('[data-conversation-id]').forEach((el) => {
                el.addEventListener('click', () => {
                    const id = parseInt(el.getAttribute('data-conversation-id'), 10);
                    this.selectConversation(id);
                });
            });
        }

        async selectConversation(id) {
            this.selectedId = id;
            this.lastMessageId = 0;
            this.renderConversationList();
            await this.loadConversationDetail(id);
            await this.loadMessages(id);
            await this.markRead(id);
        }

        async loadConversationDetail(id) {
            try {
                const res = await fetch(`/api/chat/admin/conversations/${id}`, {
                    headers: this.getAuthHeaders()
                });
                if (!res.ok) throw new Error('Failed to load conversation');
                const data = await res.json();
                this.renderThreadHeader(data.data);
                this.renderMetaPanel(data.data);
            } catch (e) {
                console.error(e);
                this.dashboard.showAlert('Failed to load conversation details', 'danger');
            }
        }

        renderThreadHeader(c) {
            const header = document.getElementById('adminChatThreadHeader');
            const empty = document.getElementById('adminChatEmptyState');
            const thread = document.getElementById('adminChatThread');
            if (empty) empty.classList.add('d-none');
            if (thread) thread.classList.remove('d-none');

            if (!header) return;
            const typeLabel = c.is_guest ? 'Guest' : 'Registered user';
            header.innerHTML = `
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h5 class="mb-0">${escapeHtml(c.display_name)}</h5>
                        <small class="text-muted">
                            ${escapeHtml(typeLabel)}
                            ${c.user_email ? ' · ' + escapeHtml(c.user_email) : ''}
                            · <span class="text-capitalize">${escapeHtml(c.status)}</span>
                        </small>
                    </div>
                    <div class="btn-group btn-group-sm">
                        ${
                            c.status !== 'closed'
                                ? `<button type="button" class="btn btn-outline-secondary" id="adminChatCloseBtn">
                                    <i class="fas fa-check me-1"></i>Close
                                   </button>`
                                : `<button type="button" class="btn btn-outline-primary" id="adminChatReopenBtn">
                                    <i class="fas fa-redo me-1"></i>Reopen
                                   </button>`
                        }
                    </div>
                </div>`;

            document.getElementById('adminChatCloseBtn')?.addEventListener('click', () =>
                this.setStatus(c.id, 'closed')
            );
            document.getElementById('adminChatReopenBtn')?.addEventListener('click', () =>
                this.setStatus(c.id, 'open')
            );
        }

        renderMetaPanel(c) {
            const panel = document.getElementById('adminChatMetaPanel');
            if (!panel) return;
            const m = c.latest_client_metadata;
            panel.innerHTML = `
                <div class="card border-0 bg-light h-100">
                    <div class="card-body small">
                        <h6 class="card-title text-uppercase text-muted mb-3" style="font-size:0.7rem;letter-spacing:.05em">
                            Client details
                        </h6>
                        <dl class="mb-0">
                            <dt class="text-muted">Participant</dt>
                            <dd class="mb-2">${escapeHtml(c.display_name)}${c.is_guest ? ' (guest)' : ''}</dd>
                            ${
                                c.user_email
                                    ? `<dt class="text-muted">Email</dt><dd class="mb-2">${escapeHtml(c.user_email)}</dd>`
                                    : ''
                            }
                            <dt class="text-muted">IP address</dt>
                            <dd class="mb-2"><code>${escapeHtml(m?.ip_address || '—')}</code></dd>
                            <dt class="text-muted">Location</dt>
                            <dd class="mb-2">${escapeHtml(formatLocation(m))}</dd>
                            ${
                                m?.location_lat != null
                                    ? `<dt class="text-muted">Coords</dt>
                                       <dd class="mb-2">${escapeHtml(m.location_lat)}, ${escapeHtml(m.location_lng)}</dd>`
                                    : ''
                            }
                            <dt class="text-muted">Device</dt>
                            <dd class="mb-2">${escapeHtml(m?.device_type || '—')}</dd>
                            <dt class="text-muted">OS</dt>
                            <dd class="mb-2">${escapeHtml(m?.device_os || '—')}</dd>
                            <dt class="text-muted">Browser</dt>
                            <dd class="mb-2">${escapeHtml(m?.device_browser || '—')}</dd>
                            <dt class="text-muted">User agent</dt>
                            <dd class="mb-0 text-break" style="font-size:0.7rem">${escapeHtml(m?.user_agent || '—')}</dd>
                        </dl>
                    </div>
                </div>`;
        }

        async loadMessages(id, opts = {}) {
            const params = new URLSearchParams();
            if (opts.incremental && this.lastMessageId > 0) {
                params.set('after_id', String(this.lastMessageId));
            }

            try {
                const res = await fetch(
                    `/api/chat/admin/conversations/${id}/messages?${params}`,
                    { headers: this.getAuthHeaders() }
                );
                if (!res.ok) throw new Error('Failed to load messages');
                const data = await res.json();
                const messages = data.data.messages || [];

                if (!opts.incremental || this.lastMessageId === 0) {
                    this.renderMessages(messages, { replace: true });
                } else if (messages.length) {
                    this.renderMessages(messages, { replace: false });
                }

                if (messages.length) {
                    this.lastMessageId = Math.max(
                        this.lastMessageId,
                        ...messages.map((m) => m.id)
                    );
                }
            } catch (e) {
                if (!opts.silent) {
                    console.error(e);
                    this.dashboard.showAlert('Failed to load messages', 'danger');
                }
            }
        }

        renderMessages(messages, { replace }) {
            const container = document.getElementById('adminChatMessages');
            if (!container) return;

            if (replace) {
                container.innerHTML = '';
                if (!messages.length) {
                    container.innerHTML =
                        '<div class="text-center text-muted py-5">No messages in this conversation yet.</div>';
                    return;
                }
            }

            const empty = container.querySelector('.text-center.text-muted');
            if (empty && messages.length) empty.remove();

            const html = messages
                .map((m) => {
                    const isAdmin = m.sender_type === 'admin';
                    const align = isAdmin ? 'justify-content-end' : 'justify-content-start';
                    const bubble = isAdmin
                        ? 'bg-primary text-white'
                        : 'bg-white border';
                    const label = isAdmin
                        ? 'Admin'
                        : m.sender_type === 'guest'
                          ? 'Guest'
                          : 'User';
                    return `
                    <div class="d-flex ${align} mb-2" data-message-id="${m.id}">
                        <div class="admin-chat-bubble ${bubble} rounded-3 px-3 py-2" style="max-width:75%">
                            <div class="small opacity-75 mb-1">${escapeHtml(label)} · ${formatTime(m.created_at)}</div>
                            <div style="white-space:pre-wrap;word-break:break-word">${escapeHtml(m.body)}</div>
                        </div>
                    </div>`;
                })
                .join('');

            container.insertAdjacentHTML('beforeend', html);
            container.scrollTop = container.scrollHeight;
        }

        async markRead(id) {
            try {
                await fetch(`/api/chat/admin/conversations/${id}/read`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                const conv = this.conversations.find((c) => c.id === id);
                if (conv) conv.admin_unread_count = 0;
                this.renderConversationList();
                await this.updateUnreadBadge();
            } catch (e) {
                // ignore
            }
        }

        async sendReply() {
            if (!this.selectedId) return;
            const input = document.getElementById('adminChatReplyInput');
            if (!input) return;
            const body = input.value.trim();
            if (!body) return;

            const btn = document.getElementById('adminChatSendBtn');
            if (btn) btn.disabled = true;

            try {
                const res = await fetch(
                    `/api/chat/admin/conversations/${this.selectedId}/messages`,
                    {
                        method: 'POST',
                        headers: this.getAuthHeaders(),
                        body: JSON.stringify({ body })
                    }
                );
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Send failed');
                }
                const data = await res.json();
                input.value = '';
                if (data.data?.message) {
                    this.renderMessages([data.data.message], { replace: false });
                    this.lastMessageId = Math.max(this.lastMessageId, data.data.message.id);
                }
                await this.loadConversations({ silent: true });
            } catch (e) {
                console.error(e);
                this.dashboard.showAlert(e.message || 'Failed to send reply', 'danger');
            } finally {
                if (btn) btn.disabled = false;
            }
        }

        async setStatus(id, status) {
            try {
                const res = await fetch(`/api/chat/admin/conversations/${id}`, {
                    method: 'PATCH',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ status })
                });
                if (!res.ok) throw new Error('Failed to update status');
                await this.loadConversationDetail(id);
                await this.loadConversations({ silent: true });
                this.dashboard.showAlert(
                    status === 'closed' ? 'Conversation closed' : 'Conversation reopened',
                    'success'
                );
            } catch (e) {
                this.dashboard.showAlert(e.message || 'Update failed', 'danger');
            }
        }

        async startConversationWithUser(userId, userName) {
            try {
                this.dashboard.showLoading();
                const res = await fetch('/api/chat/admin/conversations', {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ user_id: userId })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Failed to start conversation');
                }
                const data = await res.json();
                this.dashboard.switchSection('messages');
                await this.loadConversations({ silent: true });
                await this.selectConversation(data.data.conversation_id);
                this.dashboard.showAlert(
                    `Opened chat with ${userName || 'user'}`,
                    'success'
                );
            } catch (e) {
                console.error(e);
                this.dashboard.showAlert(e.message || 'Failed to start chat', 'danger');
            } finally {
                this.dashboard.hideLoading();
            }
        }

        bindUi() {
            document.getElementById('adminChatSearch')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.filters.search = e.target.value.trim();
                    this.page = 1;
                    this.loadConversations();
                }
            });
            document.getElementById('adminChatSearchBtn')?.addEventListener('click', () => {
                const input = document.getElementById('adminChatSearch');
                this.filters.search = input?.value.trim() || '';
                this.page = 1;
                this.loadConversations();
            });
            document.getElementById('adminChatStatusFilter')?.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.page = 1;
                this.loadConversations();
            });
            document.getElementById('adminChatParticipantFilter')?.addEventListener('change', (e) => {
                this.filters.participant = e.target.value;
                this.page = 1;
                this.loadConversations();
            });
            document.getElementById('adminChatSendBtn')?.addEventListener('click', () => this.sendReply());
            document.getElementById('adminChatReplyInput')?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendReply();
                }
            });
            document.getElementById('adminChatRefreshBtn')?.addEventListener('click', () => {
                this.loadConversations();
                if (this.selectedId) this.loadMessages(this.selectedId);
            });
        }

        activate() {
            this.bindUi();
            this.loadConversations();
            this.startPolling();
        }
    }

    function attachToDashboard() {
        if (typeof AdminDashboard === 'undefined') {
            setTimeout(attachToDashboard, 50);
            return;
        }

        const proto = AdminDashboard.prototype;
        const originalSwitch = proto.switchSection;
        const originalInit = proto.init;
        const originalRenderUsers = proto.renderUsersTable;

        proto.init = function () {
            originalInit.call(this);
            this.adminChat = new AdminChat(this);
            this.adminChat.updateUnreadBadge();
            // Poll badge periodically even outside messages
            setInterval(() => this.adminChat.updateUnreadBadge(), 15000);
        };

        proto.switchSection = function (section) {
            originalSwitch.call(this, section);
            if (section === 'messages' && this.adminChat) {
                this.adminChat.activate();
            } else if (this.adminChat) {
                this.adminChat.stopPolling();
            }
        };

        proto.renderUsersTable = function (users) {
            originalRenderUsers.call(this, users);
            // Enhance action buttons with Message after table render
            // original already wrote HTML; re-render with message button via patch
        };

        // Override renderUsersTable fully to include Message button
        proto.renderUsersTable = function (users) {
            const tableHtml = users
                .map((user) => {
                    const name = `${user.first_name} ${user.last_name}`;
                    const isAdmin = user.user_type === 'admin';
                    return `
            <tr>
                <td>${user.id}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>
                    <span class="badge bg-${this.getUserTypeColor(user.user_type)}">${escapeHtml(user.user_type)}</span>
                </td>
                <td>
                    <span class="badge bg-${user.is_active ? 'success' : 'danger'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    ${this.renderWizardProgress(user)}
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1"
                            onclick="adminDashboard.viewWizardProgress(${user.id}, '${escapeHtml(name).replace(/'/g, "\\'")}')"
                            title="View User Information">
                        <i class="fas fa-user"></i>
                    </button>
                    ${
                        !isAdmin
                            ? `<button class="btn btn-sm btn-primary me-1"
                                    onclick="adminDashboard.adminChat.startConversationWithUser(${user.id}, '${escapeHtml(name).replace(/'/g, "\\'")}')"
                                    title="Message user">
                                <i class="fas fa-comment"></i>
                               </button>`
                            : ''
                    }
                    <button class="btn btn-sm btn-outline-${user.is_active ? 'danger' : 'success'}"
                            onclick="adminDashboard.toggleUserStatus(${user.id}, ${user.is_active})">
                        ${user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>`;
                })
                .join('');

            document.getElementById('usersTableBody').innerHTML = tableHtml;
        };

        // If dashboard already constructed
        if (window.adminDashboard && !window.adminDashboard.adminChat) {
            window.adminDashboard.adminChat = new AdminChat(window.adminDashboard);
            window.adminDashboard.adminChat.updateUnreadBadge();
            setInterval(() => window.adminDashboard.adminChat.updateUnreadBadge(), 15000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachToDashboard);
    } else {
        attachToDashboard();
    }
})();
