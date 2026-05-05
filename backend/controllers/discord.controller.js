import crypto from 'node:crypto';
import User from '../models/user.model.js';
import { generateToken } from './auth.controller.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_SCOPES = ['identify', 'email', 'guilds'];
const OAUTH_CALLBACK_PATH = '/oauth/discord/callback';

function safeParseUrl(value) {
    try {
        return new URL(value);
    } catch {
        return null;
    }
}

function getFallbackRedirectUri() {
    return (
        process.env.DISCORD_REDIRECT_URI ||
        `${process.env.APP_URL || 'http://localhost:5173'}${OAUTH_CALLBACK_PATH}`
    );
}

function resolveRedirectUri(requestedRedirectUri) {
    const fallback = getFallbackRedirectUri();
    const requested = safeParseUrl(requestedRedirectUri);
    if (!requested) return fallback;

    if (requested.pathname !== OAUTH_CALLBACK_PATH) {
        return fallback;
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
        if (requested.hostname === 'localhost' || requested.hostname === '127.0.0.1') {
            return requested.toString();
        }
        return fallback;
    }

    const allowedOrigins = new Set();
    const appUrl = safeParseUrl(process.env.APP_URL);
    const envRedirect = safeParseUrl(process.env.DISCORD_REDIRECT_URI);
    if (appUrl) allowedOrigins.add(appUrl.origin);
    if (envRedirect) allowedOrigins.add(envRedirect.origin);

    if (allowedOrigins.has(requested.origin)) {
        return requested.toString();
    }

    return fallback;
}

function getDiscordConfig(redirectUri) {
    return {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: redirectUri || getFallbackRedirectUri(),
    };
}

function hasValidClientId(clientId) {
    return !!clientId && !clientId.startsWith('your_');
}

function hasValidClientSecret(clientSecret) {
    return !!clientSecret && !clientSecret.startsWith('your_');
}

export const getAuthUrl = (req, res) => {
    const redirectUri = resolveRedirectUri(req.query?.redirect_uri);
    const config = getDiscordConfig(redirectUri);

    if (!hasValidClientId(config.clientId)) {
        return res.status(500).json({
            error: 'Configuration OAuth Discord manquante',
            hint: 'Renseigne DISCORD_CLIENT_ID dans backend/.env',
        });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: 'code',
        redirect_uri: config.redirectUri,
        scope: DISCORD_SCOPES.join(' '),
        state,
        prompt: 'consent',
    });

    return res.json({
        url: `https://discord.com/oauth2/authorize?${params.toString()}`,
        state,
        redirectUri: config.redirectUri,
    });
};

async function fetchDiscordToken(code, config) {
    const body = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
    });

    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.error_description || payload.error || 'Discord token exchange failed');
    }

    return payload;
}

async function fetchDiscordUser(accessToken) {
    const [userRes, guildsRes] = await Promise.all([
        fetch(`${DISCORD_API_BASE}/users/@me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }),
    ]);

    if (!userRes.ok) {
        throw new Error('Impossible de recuperer le profil Discord');
    }

    if (!guildsRes.ok) {
        throw new Error('Impossible de recuperer les serveurs Discord');
    }

    const [user, guilds] = await Promise.all([userRes.json(), guildsRes.json()]);
    return { user, guilds };
}

function splitDisplayName(raw = '') {
    const clean = String(raw || '').trim();
    if (!clean) {
        return { firstname: 'Discord', lastname: null };
    }

    const parts = clean.split(/\s+/);
    return {
        firstname: parts[0]?.slice(0, 100) || 'Discord',
        lastname: parts.slice(1).join(' ').slice(0, 100) || null,
    };
}

function hasManageGuildPermission(permissions) {
    try {
        return (BigInt(permissions || '0') & 0x20n) === 0x20n;
    } catch {
        return false;
    }
}

export const exchangeCode = async (req, res) => {
    const { code, redirectUri } = req.body || {};
    if (!code) {
        return res.status(400).json({ error: 'Code OAuth Discord manquant' });
    }

    const config = getDiscordConfig(resolveRedirectUri(redirectUri));
    if (!hasValidClientId(config.clientId) || !hasValidClientSecret(config.clientSecret)) {
        return res.status(500).json({
            error: 'Configuration OAuth Discord manquante',
            hint: 'Renseigne DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET dans backend/.env',
        });
    }

    try {
        const tokenPayload = await fetchDiscordToken(code, config);
        const { user: discordUser, guilds } = await fetchDiscordUser(tokenPayload.access_token);

        const fallbackEmail = `discord_${discordUser.id}@azim.local`;
        const email = (discordUser.email || fallbackEmail).toLowerCase();

        let localUser = await User.findByEmail(email);
        if (!localUser) {
            const display = splitDisplayName(discordUser.global_name || discordUser.username);
            localUser = await User.create({
                email,
                password: crypto.randomUUID(),
                firstname: display.firstname,
                lastname: display.lastname,
            });
        } else {
            localUser = {
                id: localUser.id,
                email: localUser.email,
                firstname: localUser.firstname,
                lastname: localUser.lastname,
            };
        }

        const token = generateToken(localUser);
        const manageableGuilds = Array.isArray(guilds)
            ? guilds.filter((guild) => hasManageGuildPermission(guild.permissions))
            : [];

        return res.json({
            token,
            user: localUser,
            discord: {
                id: discordUser.id,
                username: discordUser.username,
                globalName: discordUser.global_name || null,
                avatarUrl: discordUser.avatar
                    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
                    : null,
            },
            guilds: manageableGuilds,
        });
    } catch (error) {
        return res.status(502).json({
            error: 'Echec de connexion Discord',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    }
};

export const getBotInviteUrl = (req, res) => {
    const { guild_id } = req.query || {};
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!hasValidClientId(clientId)) {
        return res.status(500).json({
            error: 'DISCORD_CLIENT_ID manquant',
            hint: 'Renseigne DISCORD_CLIENT_ID dans backend/.env',
        });
    }

    const params = new URLSearchParams({
        client_id: clientId,
        permissions: '268823632', // permissions minimales utiles
        scope: 'bot applications.commands',
    });

    if (guild_id && /^\d+$/.test(String(guild_id))) {
        params.set('guild_id', String(guild_id));
        params.set('disable_guild_select', 'true');
    }

    return res.json({ url: `https://discord.com/oauth2/authorize?${params.toString()}` });
};
