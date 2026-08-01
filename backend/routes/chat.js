const express = require('express');
const crypto = require('crypto');
const { body, validationResult, query } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, executeQuery } = require('../database');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { collectMessageMetadata } = require('../services/chat-metadata');

const router = express.Router();

const MAX_BODY_LENGTH = 4000;
const GUEST_TOKEN_HEADER = 'x-guest-chat-token';

function sanitizeBody(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .trim()
        .slice(0, MAX_BODY_LENGTH);
}

function previewText(text, max = 120) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max - 1) + '…';
}

function generateGuestToken() {
    return crypto.randomBytes(24).toString('hex');
}

function generateGuestDisplayName() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
        suffix += alphabet[bytes[i] % alphabet.length];
    }
    return `Guest-${suffix}`;
}

function getGuestToken(req) {
    return (
        req.headers[GUEST_TOKEN_HEADER] ||
        req.headers['X-Guest-Chat-Token'] ||
        req.body?.guest_token ||
        req.query?.guest_token ||
        null
    );
}

function clientMessageShape(row) {
    return {
        id: row.id,
        conversation_id: row.conversation_id,
        sender_type: row.sender_type,
        body: row.body,
        created_at: row.created_at,
        is_read: row.is_read
    };
}

function adminMessageShape(row) {
    return {
        ...clientMessageShape(row),
        sender_user_id: row.sender_user_id,
        ip_address: row.ip_address,
        location_country: row.location_country,
        location_region: row.location_region,
        location_city: row.location_city,
        location_lat: row.location_lat,
        location_lng: row.location_lng,
        device_type: row.device_type,
        device_os: row.device_os,
        device_browser: row.device_browser,
        user_agent: row.user_agent,
        client_metadata: row.client_metadata
    };
}

async function findConversationForClient(req) {
    if (req.user && req.user.user_type !== 'admin') {
        return getOne(
            `SELECT * FROM chat_conversations
             WHERE participant_user_id = ?
             ORDER BY
               CASE WHEN status = 'open' THEN 0 ELSE 1 END,
               last_message_at DESC NULLS LAST,
               id DESC
             LIMIT 1`,
            [req.user.id]
        );
    }

    const token = getGuestToken(req);
    if (!token) return null;

    return getOne(
        `SELECT * FROM chat_conversations
         WHERE guest_token = ?
         ORDER BY
           CASE WHEN status = 'open' THEN 0 ELSE 1 END,
           last_message_at DESC NULLS LAST,
           id DESC
         LIMIT 1`,
        [token]
    );
}

async function assertClientOwnsConversation(req, conversationId) {
    const conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [conversationId]);
    if (!conv) return { error: { status: 404, message: 'Conversation not found' } };

    if (req.user && req.user.user_type !== 'admin') {
        if (conv.participant_user_id !== req.user.id) {
            return { error: { status: 403, message: 'Access denied' } };
        }
        return { conversation: conv };
    }

    const token = getGuestToken(req);
    if (!token || conv.guest_token !== token) {
        return { error: { status: 403, message: 'Access denied' } };
    }
    return { conversation: conv };
}

// ─── Client / guest ─────────────────────────────────────────────

/**
 * Create or resume a chat session.
 */
router.post('/session', optionalAuth, async (req, res) => {
    try {
        // Logged-in non-admin user
        if (req.user && req.user.user_type !== 'admin') {
            let conv = await getOne(
                `SELECT * FROM chat_conversations
                 WHERE participant_user_id = ? AND status = 'open'
                 ORDER BY id DESC LIMIT 1`,
                [req.user.id]
            );

            if (!conv) {
                // Reopen most recent closed, or create new
                conv = await getOne(
                    `SELECT * FROM chat_conversations
                     WHERE participant_user_id = ?
                     ORDER BY id DESC LIMIT 1`,
                    [req.user.id]
                );
                if (conv && conv.status === 'closed') {
                    await updateOne(
                        'chat_conversations',
                        { status: 'open', updated_at: new Date() },
                        'id = ?',
                        [conv.id]
                    );
                    conv.status = 'open';
                } else if (!conv) {
                    const id = await insertOne('chat_conversations', {
                        participant_user_id: req.user.id,
                        status: 'open'
                    });
                    conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
                }
            }

            const user = await getOne(
                'SELECT first_name, last_name, email FROM users WHERE id = ?',
                [req.user.id]
            );

            return res.json({
                conversation_id: conv.id,
                is_guest: false,
                display_name: user
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : 'User',
                status: conv.status,
                user_unread_count: conv.user_unread_count || 0
            });
        }

        // Guest flow
        const existingToken = getGuestToken(req);
        if (existingToken) {
            let conv = await getOne(
                'SELECT * FROM chat_conversations WHERE guest_token = ? ORDER BY id DESC LIMIT 1',
                [existingToken]
            );
            if (conv) {
                if (conv.status === 'closed') {
                    await updateOne(
                        'chat_conversations',
                        { status: 'open', updated_at: new Date() },
                        'id = ?',
                        [conv.id]
                    );
                    conv.status = 'open';
                }
                return res.json({
                    conversation_id: conv.id,
                    is_guest: true,
                    guest_token: conv.guest_token,
                    display_name: conv.guest_display_name,
                    status: conv.status,
                    user_unread_count: conv.user_unread_count || 0
                });
            }
        }

        const guest_token = generateGuestToken();
        const guest_display_name = generateGuestDisplayName();
        const id = await insertOne('chat_conversations', {
            guest_token,
            guest_display_name,
            status: 'open'
        });

        res.status(201).json({
            conversation_id: id,
            is_guest: true,
            guest_token,
            display_name: guest_display_name,
            status: 'open',
            user_unread_count: 0
        });
    } catch (error) {
        console.error('Chat session error:', error);
        res.status(500).json({ message: 'Failed to start chat session', error: error.message });
    }
});

/**
 * List messages for the client's conversation.
 */
router.get('/messages', optionalAuth, async (req, res) => {
    try {
        const conv = await findConversationForClient(req);
        if (!conv) {
            return res.json({
                conversation_id: null,
                messages: [],
                user_unread_count: 0,
                status: null
            });
        }

        const afterId = parseInt(req.query.after_id, 10) || 0;
        let messages;
        if (afterId > 0) {
            messages = await getMany(
                `SELECT id, conversation_id, sender_type, body, is_read, created_at
                 FROM chat_messages
                 WHERE conversation_id = ? AND id > ?
                 ORDER BY created_at ASC, id ASC`,
                [conv.id, afterId]
            );
        } else {
            messages = await getMany(
                `SELECT id, conversation_id, sender_type, body, is_read, created_at
                 FROM chat_messages
                 WHERE conversation_id = ?
                 ORDER BY created_at ASC, id ASC
                 LIMIT 200`,
                [conv.id]
            );
        }

        res.json({
            conversation_id: conv.id,
            status: conv.status,
            user_unread_count: conv.user_unread_count || 0,
            messages: messages.map(clientMessageShape)
        });
    } catch (error) {
        console.error('Chat get messages error:', error);
        res.status(500).json({ message: 'Failed to load messages', error: error.message });
    }
});

/**
 * Send a message as user or guest.
 */
router.post(
    '/messages',
    optionalAuth,
    [
        body('body').isString().isLength({ min: 1, max: MAX_BODY_LENGTH })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Invalid message', errors: errors.array() });
            }

            // Admins should use admin endpoints
            if (req.user && req.user.user_type === 'admin') {
                return res.status(400).json({
                    message: 'Admins should use the admin chat endpoints'
                });
            }

            const text = sanitizeBody(req.body.body);
            if (!text) {
                return res.status(400).json({ message: 'Message body is required' });
            }

            let conv = await findConversationForClient(req);
            if (!conv) {
                // Auto-create session
                if (req.user) {
                    const id = await insertOne('chat_conversations', {
                        participant_user_id: req.user.id,
                        status: 'open'
                    });
                    conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
                } else {
                    const guest_token = getGuestToken(req) || generateGuestToken();
                    const guest_display_name = generateGuestDisplayName();
                    const existing = guest_token
                        ? await getOne('SELECT * FROM chat_conversations WHERE guest_token = ?', [guest_token])
                        : null;
                    if (existing) {
                        conv = existing;
                    } else {
                        const id = await insertOne('chat_conversations', {
                            guest_token,
                            guest_display_name,
                            status: 'open'
                        });
                        conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
                    }
                }
            }

            if (conv.status === 'closed') {
                await updateOne(
                    'chat_conversations',
                    { status: 'open', updated_at: new Date() },
                    'id = ?',
                    [conv.id]
                );
                conv.status = 'open';
            }

            const isGuest = !req.user;
            const sender_type = isGuest ? 'guest' : 'user';
            const metadata = await collectMessageMetadata(req, req.body);

            const messageId = await insertOne('chat_messages', {
                conversation_id: conv.id,
                sender_type,
                sender_user_id: req.user ? req.user.id : null,
                body: text,
                ip_address: metadata.ip_address,
                location_country: metadata.location_country,
                location_region: metadata.location_region,
                location_city: metadata.location_city,
                location_lat: metadata.location_lat,
                location_lng: metadata.location_lng,
                device_type: metadata.device_type,
                device_os: metadata.device_os,
                device_browser: metadata.device_browser,
                user_agent: metadata.user_agent,
                client_metadata: metadata.client_metadata || null,
                is_read: false
            });

            await executeQuery(
                `UPDATE chat_conversations SET
                    last_message_at = NOW(),
                    last_message_preview = ?,
                    admin_unread_count = COALESCE(admin_unread_count, 0) + 1,
                    updated_at = NOW(),
                    status = 'open'
                 WHERE id = ?`,
                [previewText(text), conv.id]
            );

            const message = await getOne(
                `SELECT id, conversation_id, sender_type, body, is_read, created_at
                 FROM chat_messages WHERE id = ?`,
                [messageId]
            );

            res.status(201).json({
                message: clientMessageShape(message),
                conversation_id: conv.id,
                guest_token: conv.guest_token || undefined,
                display_name: conv.guest_display_name || undefined
            });
        } catch (error) {
            console.error('Chat send message error:', error);
            res.status(500).json({ message: 'Failed to send message', error: error.message });
        }
    }
);

/**
 * Mark admin messages as read (client side).
 */
router.post('/read', optionalAuth, async (req, res) => {
    try {
        const conv = await findConversationForClient(req);
        if (!conv) {
            return res.json({ message: 'No conversation', marked: 0 });
        }

        await executeQuery(
            `UPDATE chat_messages SET is_read = TRUE
             WHERE conversation_id = ? AND sender_type = 'admin' AND is_read = FALSE`,
            [conv.id]
        );
        await updateOne(
            'chat_conversations',
            { user_unread_count: 0, updated_at: new Date() },
            'id = ?',
            [conv.id]
        );

        res.json({ message: 'Marked as read', conversation_id: conv.id });
    } catch (error) {
        console.error('Chat mark read error:', error);
        res.status(500).json({ message: 'Failed to mark as read', error: error.message });
    }
});

// ─── Admin ──────────────────────────────────────────────────────

router.get('/admin/conversations', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const offset = (page - 1) * limit;
        const status = req.query.status || '';
        const search = (req.query.search || '').trim();
        const participant = req.query.participant || ''; // registered | guest | ''

        const conditions = [];
        const params = [];

        if (status && ['open', 'closed', 'pending'].includes(status)) {
            conditions.push('c.status = ?');
            params.push(status);
        }

        if (participant === 'registered') {
            conditions.push('c.participant_user_id IS NOT NULL');
        } else if (participant === 'guest') {
            conditions.push('c.guest_token IS NOT NULL');
        }

        if (search) {
            conditions.push(`(
                c.guest_display_name ILIKE ?
                OR c.last_message_preview ILIKE ?
                OR u.email ILIKE ?
                OR u.first_name ILIKE ?
                OR u.last_name ILIKE ?
                OR CONCAT(u.first_name, ' ', u.last_name) ILIKE ?
            )`);
            const like = `%${search}%`;
            params.push(like, like, like, like, like, like);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countRows = await executeQuery(
            `SELECT COUNT(*) AS total
             FROM chat_conversations c
             LEFT JOIN users u ON u.id = c.participant_user_id
             ${where}`,
            params
        );
        const total = parseInt(countRows[0]?.total || 0, 10);

        const rows = await executeQuery(
            `SELECT c.*,
                    u.email AS user_email,
                    u.first_name AS user_first_name,
                    u.last_name AS user_last_name,
                    u.user_type AS user_type
             FROM chat_conversations c
             LEFT JOIN users u ON u.id = c.participant_user_id
             ${where}
             ORDER BY
               CASE WHEN c.admin_unread_count > 0 THEN 0 ELSE 1 END,
               c.last_message_at DESC NULLS LAST,
               c.id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const conversations = rows.map((c) => ({
            id: c.id,
            status: c.status,
            subject: c.subject,
            last_message_at: c.last_message_at,
            last_message_preview: c.last_message_preview,
            admin_unread_count: c.admin_unread_count,
            user_unread_count: c.user_unread_count,
            created_at: c.created_at,
            is_guest: !!c.guest_token,
            guest_display_name: c.guest_display_name,
            participant_user_id: c.participant_user_id,
            display_name: c.guest_token
                ? c.guest_display_name
                : [c.user_first_name, c.user_last_name].filter(Boolean).join(' ') || c.user_email || 'User',
            user_email: c.user_email || null,
            user_type: c.user_type || null
        }));

        const unreadTotal = await getOne(
            'SELECT COALESCE(SUM(admin_unread_count), 0) AS total FROM chat_conversations'
        );

        res.json({
            data: {
                conversations,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1
                },
                total_admin_unread: parseInt(unreadTotal?.total || 0, 10)
            }
        });
    } catch (error) {
        console.error('Admin list conversations error:', error);
        res.status(500).json({ message: 'Failed to list conversations', error: error.message });
    }
});

router.get('/admin/conversations/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const c = await getOne(
            `SELECT c.*,
                    u.email AS user_email,
                    u.first_name AS user_first_name,
                    u.last_name AS user_last_name,
                    u.user_type AS user_type
             FROM chat_conversations c
             LEFT JOIN users u ON u.id = c.participant_user_id
             WHERE c.id = ?`,
            [id]
        );
        if (!c) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Latest client-side metadata summary
        const latestMeta = await getOne(
            `SELECT ip_address, location_country, location_region, location_city,
                    location_lat, location_lng, device_type, device_os, device_browser,
                    user_agent, client_metadata, created_at
             FROM chat_messages
             WHERE conversation_id = ? AND sender_type IN ('user', 'guest')
             ORDER BY created_at DESC, id DESC
             LIMIT 1`,
            [id]
        );

        res.json({
            data: {
                id: c.id,
                status: c.status,
                subject: c.subject,
                last_message_at: c.last_message_at,
                last_message_preview: c.last_message_preview,
                admin_unread_count: c.admin_unread_count,
                user_unread_count: c.user_unread_count,
                created_at: c.created_at,
                is_guest: !!c.guest_token,
                guest_display_name: c.guest_display_name,
                participant_user_id: c.participant_user_id,
                display_name: c.guest_token
                    ? c.guest_display_name
                    : [c.user_first_name, c.user_last_name].filter(Boolean).join(' ') || c.user_email || 'User',
                user_email: c.user_email || null,
                user_type: c.user_type || null,
                latest_client_metadata: latestMeta || null
            }
        });
    } catch (error) {
        console.error('Admin get conversation error:', error);
        res.status(500).json({ message: 'Failed to get conversation', error: error.message });
    }
});

router.get('/admin/conversations/:id/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const conv = await getOne('SELECT id FROM chat_conversations WHERE id = ?', [id]);
        if (!conv) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const afterId = parseInt(req.query.after_id, 10) || 0;
        let messages;
        if (afterId > 0) {
            messages = await getMany(
                `SELECT * FROM chat_messages
                 WHERE conversation_id = ? AND id > ?
                 ORDER BY created_at ASC, id ASC`,
                [id, afterId]
            );
        } else {
            messages = await getMany(
                `SELECT * FROM chat_messages
                 WHERE conversation_id = ?
                 ORDER BY created_at ASC, id ASC
                 LIMIT 500`,
                [id]
            );
        }

        res.json({ data: { messages: messages.map(adminMessageShape) } });
    } catch (error) {
        console.error('Admin get messages error:', error);
        res.status(500).json({ message: 'Failed to load messages', error: error.message });
    }
});

router.post(
    '/admin/conversations/:id/messages',
    authenticateToken,
    requireAdmin,
    [body('body').isString().isLength({ min: 1, max: MAX_BODY_LENGTH })],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Invalid message', errors: errors.array() });
            }

            const id = parseInt(req.params.id, 10);
            const conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
            if (!conv) {
                return res.status(404).json({ message: 'Conversation not found' });
            }

            const text = sanitizeBody(req.body.body);
            if (!text) {
                return res.status(400).json({ message: 'Message body is required' });
            }

            const messageId = await insertOne('chat_messages', {
                conversation_id: id,
                sender_type: 'admin',
                sender_user_id: req.user.id,
                body: text,
                is_read: false
            });

            await executeQuery(
                `UPDATE chat_conversations SET
                    last_message_at = NOW(),
                    last_message_preview = ?,
                    user_unread_count = COALESCE(user_unread_count, 0) + 1,
                    updated_at = NOW(),
                    status = CASE WHEN status = 'closed' THEN 'open' ELSE status END
                 WHERE id = ?`,
                [previewText(text), id]
            );

            const message = await getOne('SELECT * FROM chat_messages WHERE id = ?', [messageId]);
            res.status(201).json({ data: { message: adminMessageShape(message) } });
        } catch (error) {
            console.error('Admin send message error:', error);
            res.status(500).json({ message: 'Failed to send message', error: error.message });
        }
    }
);

/**
 * Start (or reopen) a conversation with a registered user.
 */
router.post(
    '/admin/conversations',
    authenticateToken,
    requireAdmin,
    [
        body('user_id').isInt({ min: 1 }),
        body('body').optional().isString().isLength({ max: MAX_BODY_LENGTH })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
            }

            const userId = parseInt(req.body.user_id, 10);
            const user = await getOne(
                'SELECT id, first_name, last_name, email, user_type FROM users WHERE id = ?',
                [userId]
            );
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.user_type === 'admin') {
                return res.status(400).json({ message: 'Cannot start a chat with an admin account' });
            }

            let conv = await getOne(
                `SELECT * FROM chat_conversations
                 WHERE participant_user_id = ?
                 ORDER BY
                   CASE WHEN status = 'open' THEN 0 ELSE 1 END,
                   id DESC
                 LIMIT 1`,
                [userId]
            );

            if (!conv) {
                const id = await insertOne('chat_conversations', {
                    participant_user_id: userId,
                    status: 'open',
                    subject: req.body.subject || null
                });
                conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
            } else if (conv.status === 'closed') {
                await updateOne(
                    'chat_conversations',
                    { status: 'open', updated_at: new Date() },
                    'id = ?',
                    [conv.id]
                );
                conv.status = 'open';
            }

            let message = null;
            const text = req.body.body ? sanitizeBody(req.body.body) : '';
            if (text) {
                const messageId = await insertOne('chat_messages', {
                    conversation_id: conv.id,
                    sender_type: 'admin',
                    sender_user_id: req.user.id,
                    body: text,
                    is_read: false
                });
                await executeQuery(
                    `UPDATE chat_conversations SET
                        last_message_at = NOW(),
                        last_message_preview = ?,
                        user_unread_count = COALESCE(user_unread_count, 0) + 1,
                        updated_at = NOW()
                     WHERE id = ?`,
                    [previewText(text), conv.id]
                );
                message = await getOne('SELECT * FROM chat_messages WHERE id = ?', [messageId]);
            }

            res.status(201).json({
                data: {
                    conversation_id: conv.id,
                    user: {
                        id: user.id,
                        name: `${user.first_name} ${user.last_name}`.trim(),
                        email: user.email
                    },
                    message: message ? adminMessageShape(message) : null
                }
            });
        } catch (error) {
            console.error('Admin start conversation error:', error);
            res.status(500).json({ message: 'Failed to start conversation', error: error.message });
        }
    }
);

router.patch('/admin/conversations/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const conv = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
        if (!conv) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const updates = { updated_at: new Date() };
        if (req.body.status && ['open', 'closed', 'pending'].includes(req.body.status)) {
            updates.status = req.body.status;
        }
        if (req.body.subject !== undefined) {
            updates.subject = req.body.subject ? String(req.body.subject).slice(0, 255) : null;
        }

        await updateOne('chat_conversations', updates, 'id = ?', [id]);
        const updated = await getOne('SELECT * FROM chat_conversations WHERE id = ?', [id]);
        res.json({ data: updated });
    } catch (error) {
        console.error('Admin patch conversation error:', error);
        res.status(500).json({ message: 'Failed to update conversation', error: error.message });
    }
});

router.post('/admin/conversations/:id/read', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const conv = await getOne('SELECT id FROM chat_conversations WHERE id = ?', [id]);
        if (!conv) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        await executeQuery(
            `UPDATE chat_messages SET is_read = TRUE
             WHERE conversation_id = ? AND sender_type IN ('user', 'guest') AND is_read = FALSE`,
            [id]
        );
        await updateOne(
            'chat_conversations',
            { admin_unread_count: 0, updated_at: new Date() },
            'id = ?',
            [id]
        );

        res.json({ message: 'Marked as read', conversation_id: id });
    } catch (error) {
        console.error('Admin mark read error:', error);
        res.status(500).json({ message: 'Failed to mark as read', error: error.message });
    }
});

router.get('/admin/unread-count', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const row = await getOne(
            'SELECT COALESCE(SUM(admin_unread_count), 0) AS total FROM chat_conversations'
        );
        res.json({ data: { total: parseInt(row?.total || 0, 10) } });
    } catch (error) {
        console.error('Admin unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count', error: error.message });
    }
});

module.exports = router;
