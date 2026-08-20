(function (global) {
    function collectClientInfo() {
        const info = {
            language: navigator.language || undefined,
            languages: Array.isArray(navigator.languages)
                ? navigator.languages.slice(0, 5).join(',')
                : undefined,
            platform: navigator.platform || undefined,
            timezone: undefined,
            timezone_offset: String(new Date().getTimezoneOffset()),
            screen: undefined,
            viewport: undefined,
            page_url: undefined,
            referrer: undefined,
            color_scheme: undefined,
            touch: undefined,
            connection: undefined
        };
        try {
            info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            /* ignore */
        }
        if (global.screen) {
            info.screen = `${screen.width}x${screen.height}`;
        }
        if (global.innerWidth && global.innerHeight) {
            info.viewport = `${global.innerWidth}x${global.innerHeight}`;
        }
        try {
            info.page_url = String(location.href).slice(0, 500);
        } catch {
            /* ignore */
        }
        if (document.referrer) {
            info.referrer = String(document.referrer).slice(0, 500);
        }
        try {
            if (global.matchMedia) {
                info.color_scheme = global.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }
        } catch {
            /* ignore */
        }
        const coarse = (() => {
            try {
                return global.matchMedia && global.matchMedia('(pointer: coarse)').matches;
            } catch {
                return false;
            }
        })();
        info.touch = navigator.maxTouchPoints > 0 || coarse ? 'yes' : 'no';
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn && conn.effectiveType) {
            info.connection = String(conn.effectiveType);
        }
        return info;
    }

    function withClientInfo(payload) {
        const body = payload && typeof payload === 'object' ? { ...payload } : {};
        try {
            body.client_info = collectClientInfo();
        } catch {
            /* ignore */
        }
        return body;
    }

    global.collectClientInfo = collectClientInfo;
    global.withClientInfo = withClientInfo;
})(typeof window !== 'undefined' ? window : globalThis);
