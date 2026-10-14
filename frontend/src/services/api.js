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
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : null;
        if (!response.ok) {
            throw {
                status: response.status,
                message: data?.error || (response.status === 502
                    ? 'Le serveur ne répond pas pour le moment (502). Réessayez dans quelques instants.'
                    : `Erreur du serveur (${response.status}).`),
                hint: data?.hint,
                details: data?.details,
                code: data?.code,
            };
        }
        return data || {};
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
    getProfile: () => fetchAPI('/auth/me'),
    // Les actions sensibles demandent le mot de passe actuel (ou une connexion Discord récente)
    changePassword: (payload) => fetchAPI('/auth/password', { method: 'PUT', body: JSON.stringify(payload) }),
    changeEmail: (payload) => fetchAPI('/auth/email', { method: 'PUT', body: JSON.stringify(payload) }),
    deleteAccount: (payload) => fetchAPI('/auth/me', { method: 'DELETE', body: JSON.stringify(payload) }),
}

// Lance la connexion Discord, puis revient sur la page `returnTo`
export async function startDiscordLogin(returnTo = '/dashboard') {
    const redirectUri = `${window.location.origin}/oauth/discord/callback`;
    const data = await discordService.getAuthUrl(redirectUri);
    sessionStorage.setItem('discord_oauth_redirect_uri', data.redirectUri || redirectUri);
    sessionStorage.setItem('post_login_redirect', returnTo);
    window.location.href = data.url;
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

export const adminService = {
    getGuildConfig: (id) => fetchAPI(`/admin/guild/${encodeURIComponent(id)}/config`),
    activateIslamMode: (id, payload) => fetchAPI(`/admin/guild/${encodeURIComponent(id)}/islam-mode`, {
        method: 'POST',
        body: JSON.stringify(typeof payload === 'string' ? { code: payload } : payload),
    }),
    updateGuildConfig: (id, config) => fetchAPI(`/admin/guild/${encodeURIComponent(id)}/config`, {
        method: 'PUT',
        body: JSON.stringify(config),
    }),
    downloadAvatar: async (id, fallbackName = 'bot-avatar.png') => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/guild/${encodeURIComponent(id)}/avatar/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Impossible de télécharger l’avatar');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fallbackName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
}

export const discordService = {
    getAuthUrl: (redirectUri) =>
        fetchAPI(`/discord/url${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`),
    exchangeCode: (code, redirectUri) => fetchAPI('/discord/exchange', {
        method: 'POST',
        body: JSON.stringify({ code, redirectUri })
    }),
    getBotInviteUrl: (guildId) =>
        fetchAPI(`/discord/bot-invite${guildId ? `?guild_id=${encodeURIComponent(guildId)}` : ''}`),
}

export const systemService = {
    // Le backend répond 503 quand un service est dégradé : on lit quand même le détail.
    // `responseMs` = temps de réponse mesuré côté navigateur.
    getHealth: async () => {
        const startedAt = performance.now();
        const response = await fetch(`${API_URL}/system/health`);
        const data = await response.json().catch(() => null);
        if (!data) throw { status: response.status, message: 'Réponse de statut illisible.' };
        return { ...data, responseMs: Math.round(performance.now() - startedAt) };
    },
};

export const feedbackService = {
    getFeedbacks: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return fetchAPI(`/feedback${q ? `?${q}` : ''}`);
    },
    createFeedback: (payload) => fetchAPI('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    // Administration : statut, réponse et suppression d'un retour
    updateFeedback: (id, changes) => fetchAPI(`/feedback/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
    }),
    deleteFeedback: (id) => fetchAPI(`/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const staffService = {
    getUsers: (search = '') => fetchAPI(`/staff/users?search=${encodeURIComponent(search)}`),
    setBan: (id, banned, reason = '') => fetchAPI(`/staff/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ banned, reason }) }),
    setRole: (id, role) => fetchAPI(`/staff/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    getGuilds: () => fetchAPI('/staff/guilds'),
    setSuspended: (guildId, suspended, reason = '') => fetchAPI(`/staff/guilds/${guildId}/suspend`, { method: 'POST', body: JSON.stringify({ suspended, reason }) }),
};