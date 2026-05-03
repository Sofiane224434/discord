// services/api.js
const API_URL = import.meta.env.VITE_API_URL || '/api';
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || 'Erreur',
                hint: data.hint,
                details: data.details,
            };
        }
        return data;
    } catch (error) {
        if (!error.status) {
            throw { status: 0, message: 'Serveur inaccessible' };
        }
        throw error;
    }
}
export const authService = {
    register: (userData) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    login: (email, password) => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    getProfile: () => fetchAPI('/auth/me')
}

export const emailService = {
    send: (payload) => fetchAPI('/email/send', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const botService = {
    getOverview: () => fetchAPI('/bot/overview'),
    getGuildStats: (id) => fetchAPI(`/bot/guilds/${encodeURIComponent(id)}/stats`),
}

export const discordService = {
    getAuthUrl: (redirectUri) =>
        fetchAPI(`/discord/url${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`),
    exchangeCode: (code, redirectUri) => fetchAPI('/discord/exchange', {
        method: 'POST',
        body: JSON.stringify({ code, redirectUri })
    }),
}

export const systemService = {
    getHealth: () => fetchAPI('/system/health'),
}