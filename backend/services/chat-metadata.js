/**
 * Chat metadata: IP, device parsing, optional IP geolocation.
 */

const geoCache = new Map();
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_TIMEOUT_MS = 2500;

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const first = String(forwarded).split(',')[0].trim();
        if (first) return first;
    }
    return req.ip || req.connection?.remoteAddress || null;
}

function parseUserAgent(ua) {
    if (!ua || typeof ua !== 'string') {
        return {
            device_type: 'unknown',
            device_os: 'unknown',
            device_browser: 'unknown'
        };
    }

    let device_type = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        device_type = 'tablet';
    } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
        device_type = 'mobile';
    }

    let device_os = 'Unknown';
    if (/windows nt 10/i.test(ua)) device_os = 'Windows 10/11';
    else if (/windows nt 6\.3/i.test(ua)) device_os = 'Windows 8.1';
    else if (/windows nt 6\.2/i.test(ua)) device_os = 'Windows 8';
    else if (/windows nt 6\.1/i.test(ua)) device_os = 'Windows 7';
    else if (/windows/i.test(ua)) device_os = 'Windows';
    else if (/mac os x/i.test(ua)) {
        const m = ua.match(/Mac OS X ([\d_]+)/i);
        device_os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
    } else if (/android/i.test(ua)) {
        const m = ua.match(/Android ([\d.]+)/i);
        device_os = m ? `Android ${m[1]}` : 'Android';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        const m = ua.match(/OS ([\d_]+)/i);
        device_os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
    } else if (/linux/i.test(ua)) device_os = 'Linux';
    else if (/cros/i.test(ua)) device_os = 'Chrome OS';

    let device_browser = 'Unknown';
    if (/edg\//i.test(ua)) {
        const m = ua.match(/Edg\/([\d.]+)/i);
        device_browser = m ? `Edge ${m[1]}` : 'Edge';
    } else if (/opr\/|opera/i.test(ua)) {
        const m = ua.match(/(?:OPR|Opera)\/([\d.]+)/i);
        device_browser = m ? `Opera ${m[1]}` : 'Opera';
    } else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) {
        const m = ua.match(/Chrome\/([\d.]+)/i);
        device_browser = m ? `Chrome ${m[1]}` : 'Chrome';
    } else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) {
        const m = ua.match(/Version\/([\d.]+)/i);
        device_browser = m ? `Safari ${m[1]}` : 'Safari';
    } else if (/firefox\//i.test(ua)) {
        const m = ua.match(/Firefox\/([\d.]+)/i);
        device_browser = m ? `Firefox ${m[1]}` : 'Firefox';
    }

    return { device_type, device_os, device_browser };
}

function isPrivateIp(ip) {
    if (!ip) return true;
    const normalized = ip.replace(/^::ffff:/, '');
    if (normalized === '127.0.0.1' || normalized === '::1' || normalized === 'localhost') {
        return true;
    }
    if (/^10\./.test(normalized)) return true;
    if (/^192\.168\./.test(normalized)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return true;
    return false;
}

async function lookupGeoFromIp(ip) {
    if (!ip || isPrivateIp(ip)) {
        return { country: null, region: null, city: null };
    }

    const cached = geoCache.get(ip);
    if (cached && Date.now() - cached.at < GEO_CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
        const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
        });
        clearTimeout(timer);

        if (!res.ok) {
            throw new Error(`Geo lookup HTTP ${res.status}`);
        }

        const json = await res.json();
        if (json.error) {
            throw new Error(json.reason || 'Geo lookup error');
        }

        const data = {
            country: json.country_name || json.country || null,
            region: json.region || json.region_code || null,
            city: json.city || null
        };

        geoCache.set(ip, { at: Date.now(), data });
        return data;
    } catch (err) {
        console.warn('Chat geo lookup failed:', err.message);
        const empty = { country: null, region: null, city: null };
        geoCache.set(ip, { at: Date.now(), data: empty });
        return empty;
    }
}

function buildClientMetadata(clientInfo = {}) {
    if (!clientInfo || typeof clientInfo !== 'object') return null;
    const meta = {};
    if (clientInfo.language) meta.language = String(clientInfo.language).slice(0, 32);
    if (clientInfo.timezone) meta.timezone = String(clientInfo.timezone).slice(0, 64);
    if (clientInfo.screen) meta.screen = String(clientInfo.screen).slice(0, 32);
    if (clientInfo.platform) meta.platform = String(clientInfo.platform).slice(0, 64);
    return Object.keys(meta).length ? meta : null;
}

/**
 * Collect metadata for a client/guest message.
 * @param {import('express').Request} req
 * @param {{ client_info?: object, geo?: { lat?: number, lng?: number } }} body
 */
async function collectMessageMetadata(req, body = {}) {
    const userAgent = req.headers['user-agent'] || null;
    const ip_address = getClientIp(req);
    const parsed = parseUserAgent(userAgent);
    const geo = await lookupGeoFromIp(ip_address);

    let location_lat = null;
    let location_lng = null;
    if (body.geo && typeof body.geo === 'object') {
        const lat = Number(body.geo.lat);
        const lng = Number(body.geo.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            location_lat = lat;
            location_lng = lng;
        }
    }

    return {
        ip_address,
        location_country: geo.country,
        location_region: geo.region,
        location_city: geo.city,
        location_lat,
        location_lng,
        device_type: parsed.device_type,
        device_os: parsed.device_os,
        device_browser: parsed.device_browser,
        user_agent: userAgent ? userAgent.slice(0, 1000) : null,
        client_metadata: buildClientMetadata(body.client_info)
    };
}

module.exports = {
    getClientIp,
    parseUserAgent,
    lookupGeoFromIp,
    collectMessageMetadata,
    buildClientMetadata
};
