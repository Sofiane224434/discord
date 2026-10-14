// controllers/staff.controller.js
// Administration du site : comptes (bannissement, rôles) et serveurs (suspension du bot)
import User, { toPublicUser, resolveRole, SUPERADMIN_EMAIL } from '../models/user.model.js';
import { getBotOverview } from '../services/bot.service.js';

const BOT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS || 5000);

function getBaseUrl() {
    return (process.env.BOT_API_URL || '').trim().replace(/\/+$/, '');
}

function getBotHeaders() {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (process.env.BOT_API_TOKEN) headers['x-dashboard-token'] = process.env.BOT_API_TOKEN;
    return headers;
}

function toStaffUser(row) {
    return {
        ...toPublicUser(row),
        // L'administration a besoin de l'adresse réelle, même technique
        email: row.email,
        discordId: row.discord_id || null,
        banned: Boolean(row.banned_at),
        bannedAt: row.banned_at || null,
        banReason: row.ban_reason || null,
        isOwner: String(row.email || '').toLowerCase() === SUPERADMIN_EMAIL,
    };
}

// GET /api/staff/users?search=
export const listUsers = async (req, res) => {
    try {
        const rows = await User.list({ search: req.query.search || '', limit: req.query.limit });
        res.json({ users: rows.map(toStaffUser) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de lire les comptes', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    }
};

// PATCH /api/staff/users/:id/ban  { banned, reason }
export const setUserBan = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'Compte introuvable' });
        if (String(target.id) === String(req.user.id)) return res.status(400).json({ error: 'Vous ne pouvez pas bannir votre propre compte.' });

        const targetRole = resolveRole(target);
        // Un admin ne peut bannir que des comptes simples ; le propriétaire ne peut jamais l'être
        if (targetRole === 'superadmin' || (targetRole === 'admin' && req.user.role !== 'superadmin')) {
            return res.status(403).json({ error: 'Vous ne pouvez pas bannir ce compte.' });
        }

        const banned = Boolean(req.body?.banned);
        const reason = String(req.body?.reason || '').trim().slice(0, 300) || null;
        await User.setBanned(target.id, banned, reason);
        res.json({ user: toStaffUser(await User.findById(target.id)) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de modifier ce compte', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    }
};

// PATCH /api/staff/users/:id/role  { role: 'user' | 'admin' } — super administrateur uniquement
export const setUserRole = async (req, res) => {
    try {
        const role = req.body?.role;
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Rôle inconnu' });

        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'Compte introuvable' });
        if (resolveRole(target) === 'superadmin') return res.status(403).json({ error: 'Le rôle du propriétaire ne peut pas être modifié.' });

        await User.setRole(target.id, role);
        res.json({ user: toStaffUser(await User.findById(target.id)) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de modifier ce rôle', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    }
};

// GET /api/staff/guilds — tous les serveurs du bot
export const listGuilds = async (_req, res) => {
    try {
        const { overview } = await getBotOverview();
        const guilds = (overview?.guilds || []).map((guild) => ({
            id: String(guild.id),
            name: guild.name,
            iconUrl: guild.iconUrl || null,
            memberCount: Number(guild.memberCount || 0),
            islamModeEnabled: Boolean(guild.islamModeEnabled),
            publicInviteUrl: guild.publicInviteUrl || null,
            suspended: Boolean(guild.suspended),
        }));
        res.json({ guilds });
    } catch (error) {
        res.status(502).json({ error: 'Impossible de joindre le bot', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    }
};

// POST /api/staff/guilds/:guildId/suspend  { suspended, reason }
export const setGuildSuspended = async (req, res) => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return res.status(503).json({ error: 'Bot API non configurée' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
    try {
        const response = await fetch(`${baseUrl}/guild/${encodeURIComponent(req.params.guildId)}/suspend`, {
            method: 'POST',
            headers: getBotHeaders(),
            body: JSON.stringify({ suspended: Boolean(req.body?.suspended), reason: req.body?.reason }),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return res.status(502).json({ error: data.error || 'Le bot a refusé la demande' });
        res.json(data);
    } catch (error) {
        res.status(502).json({ error: 'Le bot Discord ne répond pas.', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    } finally {
        clearTimeout(timeout);
    }
};
