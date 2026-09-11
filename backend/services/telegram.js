const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STORE_PATH = path.join(__dirname, '../../data/telegram-chats.json');
const POLL_TIMEOUT_SEC = 25;

let offset = 0;
let polling = false;
let client = null;

function token() {
    return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

function api() {
    const t = token();
    if (!t) return null;
    if (!client) {
        client = axios.create({
            baseURL: `https://api.telegram.org/bot${t}`,
            timeout: (POLL_TIMEOUT_SEC + 10) * 1000
        });
    }
    return client;
}

function loadStore() {
    const envIds = (process.env.TELEGRAM_CHAT_ID || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    let chats = [];
    let storedOffset = 0;
    try {
        if (fs.existsSync(STORE_PATH)) {
            const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
            chats = Array.isArray(raw.chats) ? raw.chats.map(String) : [];
            storedOffset = Number(raw.offset) || 0;
        }
    } catch (err) {
        console.warn('Telegram store read failed:', err.message);
    }
    const merged = [...new Set([...envIds.map(String), ...chats])];
    return { chats: merged, offset: storedOffset };
}

function saveStore(chats, nextOffset) {
    try {
        const dir = path.dirname(STORE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
            STORE_PATH,
            JSON.stringify({ chats: [...new Set(chats.map(String))], offset: nextOffset || 0 }, null, 2)
        );
    } catch (err) {
        console.warn('Telegram store write failed:', err.message);
    }
}

function recipientChats() {
    return loadStore().chats;
}

function addChat(chatId) {
    const store = loadStore();
    const id = String(chatId);
    if (!store.chats.includes(id)) {
        store.chats.push(id);
        saveStore(store.chats, store.offset || offset);
    }
    return store.chats;
}

function removeChat(chatId) {
    const store = loadStore();
    const next = store.chats.filter((id) => id !== String(chatId));
    saveStore(next, store.offset || offset);
    return next;
}

async function sendToChat(chatId, text) {
    const http = api();
    if (!http) return;
    await http.post('/sendMessage', {
        chat_id: chatId,
        text,
        disable_web_page_preview: true
    });
}

async function notify(text) {
    const http = api();
    if (!http) return;
    const chats = recipientChats();
    if (!chats.length) {
        console.warn('Telegram: no chat subscribed yet. Open the bot and send /start.');
        return;
    }
    await Promise.allSettled(chats.map((chatId) => sendToChat(chatId, text)));
}

function line(label, value) {
    if (value == null || value === '') return null;
    return `${label}: ${value}`;
}

async function notifySignup(user) {
    try {
        const phone = [user.country_code, user.phone].filter(Boolean).join(' ').trim();
        const lines = [
            'New FlexJobs signup',
            line('Name', [user.first_name, user.last_name].filter(Boolean).join(' ')),
            line('Email', user.email),
            line('Phone', phone || null),
            line('Country code', user.country_code),
            line('Location', user.location),
            line('User ID', user.id)
        ].filter(Boolean);
        await notify(lines.join('\n'));
    } catch (err) {
        console.warn('Telegram signup notify failed:', err.message);
    }
}

async function notifyAdminChatMessage({ senderName, senderEmail, senderType, body, conversationId }) {
    try {
        const preview = String(body || '').replace(/\s+/g, ' ').trim().slice(0, 500);
        const lines = [
            'New admin-panel chat message',
            line('From', senderName || senderType || 'visitor'),
            line('Email', senderEmail),
            line('Type', senderType),
            line('Conversation', conversationId),
            '',
            preview || '(empty message)'
        ].filter((item) => item !== null);
        await notify(lines.join('\n'));
    } catch (err) {
        console.warn('Telegram chat notify failed:', err.message);
    }
}

async function handleUpdate(update) {
    const message = update.message || update.edited_message;
    if (!message || !message.chat) return;
    const chatId = message.chat.id;
    const text = (message.text || '').trim();
    const command = text.split(/\s+/)[0].split('@')[0].toLowerCase();

    if (command === '/start') {
        addChat(chatId);
        await sendToChat(
            chatId,
            'Subscribed. I will send FlexJobs UK alerts here for new signups and messages in the admin panel.\n\nSend /stop to unsubscribe.'
        );
        return;
    }
    if (command === '/stop') {
        removeChat(chatId);
        await sendToChat(chatId, 'Unsubscribed. Send /start to receive alerts again.');
        return;
    }
    if (command === '/help') {
        await sendToChat(chatId, 'Commands:\n/start — subscribe to signup and chat alerts\n/stop — unsubscribe');
    }
}

async function pollOnce() {
    const http = api();
    if (!http) return;
    const store = loadStore();
    if (!offset) offset = store.offset || 0;
    const { data } = await http.get('/getUpdates', {
        params: {
            offset: offset || undefined,
            timeout: POLL_TIMEOUT_SEC,
            allowed_updates: JSON.stringify(['message'])
        }
    });
    const updates = data.result || [];
    for (const update of updates) {
        offset = update.update_id + 1;
        try {
            await handleUpdate(update);
        } catch (err) {
            console.warn('Telegram update handling failed:', err.message);
        }
    }
    if (updates.length) {
        saveStore(loadStore().chats, offset);
    }
}

function startPolling() {
    if (!token()) {
        console.warn('Telegram bot disabled: TELEGRAM_BOT_TOKEN is not set');
        return;
    }
    if (polling) return;
    polling = true;
    const loop = async () => {
        while (polling) {
            try {
                await pollOnce();
            } catch (err) {
                console.warn('Telegram poll error:', err.message);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    };
    loop();
    console.log('Telegram bot polling for /start subscriptions');
}

function stopPolling() {
    polling = false;
}

module.exports = {
    notify,
    notifySignup,
    notifyAdminChatMessage,
    startPolling,
    stopPolling
};
