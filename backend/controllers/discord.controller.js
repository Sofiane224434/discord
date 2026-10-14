import crypto from 'node:crypto';
import User, { toPublicUser } from '../models/user.model.js';
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
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [userRes, firstGuildsRes] = await Promise.all([
        fetch(`${DISCORD_API_BASE}/users/@me`, { headers }),
        fetch(`${DISCORD_API_BASE}/users/@me/guilds?limit=200`, { headers }),
    ]);

    if (!userRes.ok) {
        throw new Error('Impossible de recuperer le profil Discord');
    }

    if (!firstGuildsRes.ok) {
        throw new Error('Impossible de recuperer les serveurs Discord');
    }

    const [user, firstGuildPage] = await Promise.all([userRes.json(), firstGuildsRes.json()]);
    const guilds = Array.isArray(firstGuildPage) ? [...firstGuildPage] : [];
    let after = guilds.at(-1)?.id;

    for (let page = 1; guilds.length && guilds.length % 200 === 0 && after && page < 10; page += 1) {
        const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds?limit=200&after=${encodeURIComponent(after)}`, { headers });
        if (!response.ok) throw new Error('Impossible de recuperer tous les serveurs Discord');
        const nextPage = await response.json();
        if (!Array.isArray(nextPage) || nextPage.length === 0) break;

        const nextAfter = nextPage[nextPage.length - 1]?.id;
        if (!nextAfter || String(nextAfter) === String(after)) break;
        guilds.push(...nextPage);
        after = nextAfter;
    }

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
        return (BigInt(permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

function isGuildManager(guild) {
    return Boolean(guild?.owner) || hasManageGuildPermission(guild?.permissions);
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
        const discordInfo = {
            id: String(discordUser.id),
            username: discordUser.global_name || discordUser.username,
            avatar: discordUser.avatar || null,
        };

        // Le compte est d'abord retrouvé par son ID Discord (l'email peut avoir été changé sur le site)
        let localUser = await User.findByDiscordId(discordInfo.id);
        if (!localUser) {
            const byEmail = await User.findByEmail(email);
            if (byEmail && !byEmail.discord_id) localUser = byEmail;
        }

        if (!localUser) {
            const display = splitDisplayName(discordUser.global_name || discordUser.username);
            localUser = await User.create({
                // Adresse déjà prise par un autre compte lié à Discord : on garde l'adresse technique
                email: (await User.findByEmail(email)) ? fallbackEmail : email,
                password: crypto.randomUUID(),
                firstname: display.firstname,
                lastname: display.lastname,
                hasPassword: false,
                discord: discordInfo,
            });
        } else {
            // Pseudo et avatar changent côté Discord : on les remet à jour à chaque connexion
            await User.linkDiscord(localUser.id, discordInfo);
            localUser = await User.findById(localUser.id);
        }

        if (localUser.banned_at) {
            return res.status(403).json({ error: 'Ce compte a été suspendu.', hint: localUser.ban_reason || undefined });
        }

        const allGuilds = (Array.isArray(guilds) ? guilds : []).map((guild) => ({
            ...guild,
            iconUrl: guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${String(guild.icon).startsWith('a_') ? 'gif' : 'png'}?size=128`
                : null,
        }));
        const manageableGuildIds = allGuilds.filter(isGuildManager).map((guild) => String(guild.id));
        const token = generateToken(localUser, manageableGuildIds, 'discord');

        return res.json({
            token,
            user: { ...toPublicUser(localUser), recentDiscordAuth: true },
            guilds: allGuilds,
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
        permissions: '1099780451415', // utiles + modération (bannir, expulser, exclure, gérer les salons, invitations)
        scope: 'bot applications.commands',
    });

    // Présélectionne le serveur sans verrouiller la liste : avec disable_guild_select, Discord
    // bloque le menu sur un champ vide quand le serveur ne peut pas être choisi.
    if (guild_id && /^\d+$/.test(String(guild_id))) {
        params.set('guild_id', String(guild_id));
    }

    return res.json({ url: `https://discord.com/oauth2/authorize?${params.toString()}` });
};
