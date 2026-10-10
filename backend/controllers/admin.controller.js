// controllers/admin.controller.js
// Proxy les requêtes de config vers l'API interne du bot Discord

const BOT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS || 5000);

function getBaseUrl() {
    const raw = process.env.BOT_API_URL || '';
    return raw.trim().replace(/\/+$/, '');
}

function getBotHeaders() {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    const token = process.env.BOT_API_TOKEN;
    if (token) {
        headers['x-dashboard-token'] = token;
    }
    return headers;
}

function mapBotErrorStatus(status) {
    if ([400, 404, 409, 422].includes(status)) return status;
    if (status === 401 || status === 503) return 503;
    return 502;
}

/**
 * Vérifie que l'utilisateur a bien la permission Manage Guild sur le serveur demandé.
 * Les guilds Discord de l'utilisateur sont stockées dans son profil après OAuth.
 */
function hasManageGuildPermission(userGuilds, guildId) {
    if (!Array.isArray(userGuilds)) return false;
    if (userGuilds.some((id) => String(id) === String(guildId))) return true;
    const guild = userGuilds.find((g) => String(g.id) === String(guildId));
    if (!guild) return false;
    try {
        return (BigInt(guild.permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

export const getGuildConfig = async (req, res) => {
    const { guildId } = req.params;
    if (!guildId) return res.status(400).json({ error: 'Guild ID requis' });

    // Vérifier les permissions de l'utilisateur
    const userGuilds = req.user?.discord_guild_ids || [];
    if (!hasManageGuildPermission(userGuilds, guildId)) {
        return res.status(403).json({
            error: 'Permission insuffisante',
            hint: 'Vous devez avoir la permission "Gérer le serveur" sur ce serveur Discord.',
        });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
        return res.status(503).json({ error: 'Bot API non configurée' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

    try {
        const response = await fetch(`${baseUrl}/guild/${encodeURIComponent(guildId)}/config`, {
            method: 'GET',
            headers: getBotHeaders(),
            signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const status = mapBotErrorStatus(response.status);
            return res.status(status).json({
                error: response.status === 401
                    ? 'L’accès du panel au bot est refusé. Vérifiez le jeton partagé.'
                    : data.error || 'Impossible de récupérer la configuration du serveur',
                hint: data.hint,
                details: process.env.NODE_ENV === 'production' ? undefined : data.details,
            });
        }
        res.json(data);
    } catch (error) {
        res.status(502).json({
            error: 'Impossible de recuperer la config du serveur',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    } finally {
        clearTimeout(timeout);
    }
};

export const updateGuildConfig = async (req, res) => {
    const { guildId } = req.params;
    if (!guildId) return res.status(400).json({ error: 'Guild ID requis' });

    // Vérifier les permissions
    const userGuilds = req.user?.discord_guild_ids || [];
    if (!hasManageGuildPermission(userGuilds, guildId)) {
        return res.status(403).json({
            error: 'Permission insuffisante',
            hint: 'Vous devez avoir la permission "Gérer le serveur" sur ce serveur Discord.',
        });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
        return res.status(503).json({ error: 'Bot API non configurée' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

    try {
        const response = await fetch(`${baseUrl}/guild/${encodeURIComponent(guildId)}/config`, {
            method: 'PUT',
            headers: getBotHeaders(),
            body: JSON.stringify(req.body),
            signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const status = mapBotErrorStatus(response.status);
            return res.status(status).json({
                error: response.status === 401
                    ? 'L’accès du panel au bot est refusé. Vérifiez le jeton partagé.'
                    : data.error || 'Impossible de mettre à jour la configuration',
                hint: data.hint,
                details: process.env.NODE_ENV === 'production' ? undefined : data.details,
            });
        }
        res.json(data);
    } catch (error) {
        res.status(502).json({
            error: 'Impossible de mettre a jour la config',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    } finally {
        clearTimeout(timeout);
    }
};

export const activateIslamMode = async (req, res) => {
    const { guildId } = req.params;
    if (!guildId) return res.status(400).json({ error: 'Guild ID requis' });

    const userGuilds = req.user?.discord_guild_ids || [];
    if (!hasManageGuildPermission(userGuilds, guildId)) {
        return res.status(403).json({
            error: 'Permission insuffisante',
            hint: 'Vous devez avoir la permission « Gérer le serveur » sur ce serveur Discord.',
        });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) return res.status(503).json({ error: 'Bot API non configurée' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
    try {
        const response = await fetch(`${baseUrl}/guild/${encodeURIComponent(guildId)}/islam-code`, {
            method: 'POST',
            headers: getBotHeaders(),
            body: JSON.stringify({ code: req.body?.code, action: req.body?.action }),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const status = [400, 404, 503].includes(response.status) ? response.status : 502;
            return res.status(status).json({
                error: data.error || 'Code invalide ou impossible de modifier le mode',
                hint: data.hint,
                details: process.env.NODE_ENV === 'production' ? undefined : data.details,
            });
        }
        return res.json(data);
    } catch (error) {
        return res.status(502).json({
            error: 'Le bot Discord ne répond pas. Vérifiez qu’il est bien démarré.',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    } finally {
        clearTimeout(timeout);
    }
};

export const downloadGuildBotAvatar = async (req, res) => {
    const { guildId } = req.params;
    if (!guildId) return res.status(400).json({ error: 'Guild ID requis' });

    const userGuilds = req.user?.discord_guild_ids || [];
    if (!hasManageGuildPermission(userGuilds, guildId)) {
        return res.status(403).json({
            error: 'Permission insuffisante',
            hint: 'Vous devez avoir la permission "Gérer le serveur" sur ce serveur Discord.',
        });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) return res.status(503).json({ error: 'Bot API non configurée' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

    try {
        const response = await fetch(`${baseUrl}/guild/${encodeURIComponent(guildId)}/config`, {
            method: 'GET',
            headers: getBotHeaders(),
            signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error || 'Impossible de récupérer les informations du serveur',
            });
        }

        const avatarUrl = data.profile?.currentAvatarUrl || data.profile?.globalAvatarUrl;
        if (!avatarUrl) {
            return res.status(404).json({ error: 'Avatar introuvable pour ce bot' });
        }

        const imageRes = await fetch(avatarUrl);
        if (!imageRes.ok) {
            return res.status(502).json({ error: 'Impossible de télécharger l\'image depuis le CDN Discord' });
        }

        const contentType = imageRes.headers.get('content-type') || 'image/png';
        const rawName = data.profile?.botDisplayName || data.profile?.botUsername || 'bot';
        const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}-avatar.png"`);

        const arrayBuffer = await imageRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        return res.status(502).json({
            error: 'Impossible de télécharger l\'avatar',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    } finally {
        clearTimeout(timeout);
    }
};
