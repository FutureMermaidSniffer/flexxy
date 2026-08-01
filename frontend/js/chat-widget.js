/**
 * Site-wide FlexJobs chat widget (registered users + guests).
 */
(function () {
    if (window.FlexJobsChatWidget) return;

    const GUEST_KEY = 'flexjobs_guest_chat';
    const POLL_OPEN_MS = 4000;
    const POLL_CLOSED_MS = 15000;

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function getAuthToken() {
        return localStorage.getItem('flexjobs_token');
    }

    function getAuthUser() {
        try {
            return JSON.parse(localStorage.getItem('flexjobs_user') || 'null');
        } catch {
            return null;
        }
    }

    function getGuest() {
        try {
            return JSON.parse(localStorage.getItem(GUEST_KEY) || 'null');
        } catch {
            return null;
        }
    }

    function setGuest(data) {
        localStorage.setItem(GUEST_KEY, JSON.stringify(data));
    }

    function collectClientInfo() {
        const info = {
            language: navigator.language || undefined,
            platform: navigator.platform || undefined,
            timezone: undefined,
            screen: undefined
        };
        try {
            info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            /* ignore */
        }
        if (window.screen) {
            info.screen = `${screen.width}x${screen.height}`;
        }
        return info;
    }

    class ChatWidget {
        constructor() {
            this.open = false;
            this.conversationId = null;
            this.displayName = null;
            this.isGuest = true;
            this.guestToken = getGuest()?.token || null;
            this.messages = [];
            this.lastMessageId = 0;
            this.pollTimer = null;
            this.sessionReady = false;
            this.sending = false;
            this.init();
        }

        init() {
            // Skip on admin dashboard
            if (document.body.classList.contains('admin-dashboard')) return;

            this.injectStyles();
            this.renderShell();
            this.bindEvents();
            this.schedulePoll();

            // Optional: request geo quietly (won't prompt until user interacts on some browsers)
            // We only request when panel first opens to avoid surprise prompts.
        }

        injectStyles() {
            if (document.querySelector('link[href*="chat-widget.css"]')) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/chat-widget.css';
            document.head.appendChild(link);
        }

        renderShell() {
            if (document.getElementById('fjChatFab')) return;

            const fab = document.createElement('button');
            fab.type = 'button';
            fab.id = 'fjChatFab';
            fab.className = 'fj-chat-fab';
            fab.setAttribute('aria-label', 'Chat with support');
            fab.innerHTML = `
                <i class="fas fa-comments" aria-hidden="true"></i>
                <span class="fj-chat-fab-badge" id="fjChatBadge">0</span>
            `;

            const panel = document.createElement('div');
            panel.id = 'fjChatPanel';
            panel.className = 'fj-chat-panel';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-label', 'Support chat');
            panel.innerHTML = `
                <div class="fj-chat-header">
                    <div>
                        <h3>Chat with us</h3>
                        <p class="fj-chat-subtitle" id="fjChatSubtitle">We typically reply soon</p>
                    </div>
                    <div class="fj-chat-header-actions">
                        <button type="button" id="fjChatClose" aria-label="Close chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="fj-chat-messages" id="fjChatMessages">
                    <div class="fj-chat-empty">Say hello — our team is here to help.</div>
                </div>
                <div class="fj-chat-footer">
                    <textarea id="fjChatInput" rows="1" placeholder="Type a message…" maxlength="4000"></textarea>
                    <button type="button" id="fjChatSend" aria-label="Send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            `;

            document.body.appendChild(fab);
            document.body.appendChild(panel);
        }

        bindEvents() {
            document.getElementById('fjChatFab')?.addEventListener('click', () => this.toggle());
            document.getElementById('fjChatClose')?.addEventListener('click', () => this.close());
            document.getElementById('fjChatSend')?.addEventListener('click', () => this.send());
            document.getElementById('fjChatInput')?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.send();
                }
            });

            document.addEventListener('visibilitychange', () => {
                this.schedulePoll();
            });

            // Header message button
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.main-header__message-btn');
                if (btn) {
                    e.preventDefault();
                    this.openPanel();
                }
            });

            // Global helper for support page
            window.openFlexJobsChat = () => this.openPanel();
        }

        headers(json = true) {
            const h = {};
            if (json) h['Content-Type'] = 'application/json';
            const token = getAuthToken();
            const user = getAuthUser();
            if (token && user && user.user_type !== 'admin') {
                h['Authorization'] = `Bearer ${token}`;
            } else if (this.guestToken) {
                h['X-Guest-Chat-Token'] = this.guestToken;
            }
            return h;
        }

        async ensureSession() {
            if (this.sessionReady && this.conversationId) return;

            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify({ client_info: collectClientInfo() })
            });
            if (!res.ok) throw new Error('Could not start chat session');
            const data = await res.json();

            this.conversationId = data.conversation_id;
            this.displayName = data.display_name;
            this.isGuest = !!data.is_guest;
            if (data.guest_token) {
                this.guestToken = data.guest_token;
                setGuest({ token: data.guest_token, displayName: data.display_name });
            }
            this.sessionReady = true;
            this.updateSubtitle();
            this.setBadge(data.user_unread_count || 0);
        }

        updateSubtitle() {
            const el = document.getElementById('fjChatSubtitle');
            if (!el) return;
            if (this.displayName) {
                el.textContent = this.isGuest
                    ? `Chatting as ${this.displayName}`
                    : `Signed in as ${this.displayName}`;
            }
        }

        setBadge(count) {
            const badge = document.getElementById('fjChatBadge');
            if (!badge) return;
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : String(count);
                badge.classList.add('is-visible');
            } else {
                badge.classList.remove('is-visible');
            }
        }

        toggle() {
            if (this.open) this.close();
            else this.openPanel();
        }

        close() {
            this.open = false;
            document.getElementById('fjChatPanel')?.classList.remove('is-open');
            this.schedulePoll();
        }

        async openPanel() {
            this.open = true;
            document.getElementById('fjChatPanel')?.classList.add('is-open');
            this.schedulePoll();
            try {
                await this.ensureSession();
                await this.fetchMessages({ full: true });
                await this.markRead();
            } catch (e) {
                console.error('Chat open error', e);
                this.showSystem('Unable to connect to chat. Please try again.');
            }
            document.getElementById('fjChatInput')?.focus();
        }

        showSystem(text) {
            const box = document.getElementById('fjChatMessages');
            if (!box) return;
            box.insertAdjacentHTML(
                'beforeend',
                `<div class="fj-chat-msg fj-chat-msg--system">${escapeHtml(text)}</div>`
            );
        }

        renderMessages(messages, { replace }) {
            const box = document.getElementById('fjChatMessages');
            if (!box) return;

            if (replace) {
                this.messages = messages.slice();
                if (!messages.length) {
                    box.innerHTML =
                        '<div class="fj-chat-empty">Say hello — our team is here to help.</div>';
                    return;
                }
                box.innerHTML = messages.map((m) => this.messageHtml(m)).join('');
            } else {
                const empty = box.querySelector('.fj-chat-empty');
                if (empty) empty.remove();
                messages.forEach((m) => {
                    if (this.messages.some((x) => x.id === m.id)) return;
                    this.messages.push(m);
                    box.insertAdjacentHTML('beforeend', this.messageHtml(m));
                });
            }
            box.scrollTop = box.scrollHeight;
        }

        messageHtml(m) {
            const isAdmin = m.sender_type === 'admin';
            const isSystem = m.sender_type === 'system';
            const cls = isSystem
                ? 'fj-chat-msg--system'
                : isAdmin
                  ? 'fj-chat-msg--admin'
                  : 'fj-chat-msg--user';
            const label = isAdmin ? 'Support' : isSystem ? '' : 'You';
            return `
                <div class="fj-chat-msg ${cls}" data-id="${m.id}">
                    ${label ? `<div class="fj-chat-msg-meta">${escapeHtml(label)} · ${formatTime(m.created_at)}</div>` : ''}
                    <div>${escapeHtml(m.body)}</div>
                </div>`;
        }

        async fetchMessages({ full } = {}) {
            const params = new URLSearchParams();
            if (!full && this.lastMessageId > 0) {
                params.set('after_id', String(this.lastMessageId));
            }
            const res = await fetch(`/api/chat/messages?${params}`, {
                headers: this.headers(false)
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.conversation_id) this.conversationId = data.conversation_id;

            const msgs = data.messages || [];
            if (full || this.lastMessageId === 0) {
                this.renderMessages(msgs, { replace: true });
            } else if (msgs.length) {
                this.renderMessages(msgs, { replace: false });
                if (this.open) await this.markRead();
            }

            if (msgs.length) {
                this.lastMessageId = Math.max(this.lastMessageId, ...msgs.map((m) => m.id));
            } else if (full) {
                this.lastMessageId = 0;
            }

            if (!this.open) {
                this.setBadge(data.user_unread_count || 0);
            } else {
                this.setBadge(0);
            }
        }

        async markRead() {
            try {
                await fetch('/api/chat/read', {
                    method: 'POST',
                    headers: this.headers()
                });
                this.setBadge(0);
            } catch {
                /* ignore */
            }
        }

        async send() {
            if (this.sending) return;
            const input = document.getElementById('fjChatInput');
            const body = (input?.value || '').trim();
            if (!body) return;

            this.sending = true;
            const sendBtn = document.getElementById('fjChatSend');
            if (sendBtn) sendBtn.disabled = true;

            try {
                await this.ensureSession();
                const res = await fetch('/api/chat/messages', {
                    method: 'POST',
                    headers: this.headers(),
                    body: JSON.stringify({
                        body,
                        client_info: collectClientInfo()
                    })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Failed to send');
                }
                const data = await res.json();
                if (data.guest_token) {
                    this.guestToken = data.guest_token;
                    setGuest({
                        token: data.guest_token,
                        displayName: data.display_name || this.displayName
                    });
                }
                if (input) input.value = '';
                if (data.message) {
                    this.renderMessages([data.message], { replace: false });
                    this.lastMessageId = Math.max(this.lastMessageId, data.message.id);
                }
            } catch (e) {
                console.error(e);
                this.showSystem(e.message || 'Could not send message');
            } finally {
                this.sending = false;
                if (sendBtn) sendBtn.disabled = false;
            }
        }

        schedulePoll() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
            if (document.visibilityState === 'hidden') return;

            const ms = this.open ? POLL_OPEN_MS : POLL_CLOSED_MS;
            this.pollTimer = setInterval(async () => {
                if (document.visibilityState === 'hidden') return;
                try {
                    if (!this.sessionReady && !getAuthToken() && !this.guestToken) {
                        // Only poll after session exists or user has guest token
                        if (!this.open) return;
                    }
                    if (this.open || this.guestToken || getAuthToken()) {
                        if (!this.sessionReady && (this.open || this.guestToken || getAuthToken())) {
                            try {
                                await this.ensureSession();
                            } catch {
                                return;
                            }
                        }
                        if (this.sessionReady) {
                            await this.fetchMessages({ full: false });
                        }
                    }
                } catch {
                    /* ignore poll errors */
                }
            }, ms);
        }
    }

    function boot() {
        if (document.body?.classList.contains('admin-dashboard')) return;
        window.FlexJobsChatWidget = new ChatWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
