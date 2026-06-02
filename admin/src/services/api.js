import axios from 'axios';

const DEFAULT_API_URL = '/api/portal-admin';

function toSameOriginApiPath(rawUrl) {
    if (!rawUrl) {
        return rawUrl;
    }

    try {
        const parsed = new URL(rawUrl, window.location.origin);
        if (
            parsed.pathname?.startsWith('/api/')
            || parsed.hostname === 'api'
            || parsed.hostname === 'portal-api'
        ) {
            return parsed.pathname || DEFAULT_API_URL;
        }
    } catch {
        return rawUrl;
    }

    return rawUrl;
}

function resolveApiUrl() {
    const configuredUrl = import.meta.env.VITE_ADMIN_API_URL;
    if (!configuredUrl) {
        return DEFAULT_API_URL;
    }

    try {
        const parsed = new URL(configuredUrl, window.location.origin);

        // Prefer same-origin API routes in browser to avoid CORS and Docker-only hostnames.
        const normalizedPath = toSameOriginApiPath(parsed.toString());
        if (normalizedPath !== parsed.toString()) {
            return normalizedPath;
        }

        return configuredUrl;
    } catch {
        return configuredUrl;
    }
}

const API_URL = resolveApiUrl();

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        config.baseURL = toSameOriginApiPath(config.baseURL);
        config.url = toSameOriginApiPath(config.url);

        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
            const csrfToken = sessionStorage.getItem('csrf_token');
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const detail = error.response?.data?.detail;
        const isCsrfError = error.response?.status === 403
            && typeof detail === 'string'
            && detail.toLowerCase().includes('csrf token');

        if (isCsrfError) {
            sessionStorage.removeItem('csrf_token');
            if (!window.location.pathname.endsWith('/login')) {
                window.location.href = '/portal-admin/login';
            }
        }

        if (error.response?.status === 401) {
            sessionStorage.removeItem('csrf_token');
            if (!window.location.pathname.endsWith('/login')) {
                window.location.href = '/portal-admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
