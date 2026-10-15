import { Readable } from 'node:stream';
import { query } from '../config/db.js';

async function checkDB() {
    try {
        await query('SELECT 1');
        return { status: 'ok' };
    } catch {
        return { status: 'error' };
    }
}

async function checkBotAPI() {
    const base = (process.env.BOT_API_URL || '').trim().replace(/\/+$/, '');
    if (!base) return { status: 'unconfigured' };
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3000);
        const startedAt = Date.now();
        const res = await fetch(`${base}/health`, { signal: controller.signal });
        const responseMs = Date.now() - startedAt;
        clearTimeout(tid);
        // On ne renvoie que des infos publiques (pas les erreurs détaillées du bot)
        const body = await res.json().catch(() => ({}));
        const uptimeSeconds = Number(body?.observability?.uptimeSeconds) || null;
        const d = body?.discord;
        const discord = d ? {
            ready: Boolean(d.ready),
            ping: Number.isFinite(d.ping) ? d.ping : null,
            guildCount: Number(d.guildCount) || 0,
            shardCount: Math.max(1, Number(d.shardCount) || 1),
            shards: Array.isArray(d.shards)
                ? d.shards.map((s) => ({ id: Number(s.id) || 0, ping: Number.isFinite(s.ping) ? s.ping : null, ready: Boolean(s.ready) }))
                : [],
        } : null;
        return { status: res.ok ? 'ok' : 'degraded', responseMs, uptimeSeconds, discord };
    } catch {
        return { status: 'error' };
    }
}

function checkOAuth() {
    const clientId = Boolean((process.env.DISCORD_CLIENT_ID || '').trim());
    const clientSecret = Boolean((process.env.DISCORD_CLIENT_SECRET || '').trim());
    const redirectUri = Boolean(
        (process.env.DISCORD_REDIRECT_URI || process.env.APP_URL || '').trim()
    );
    return {
        status: clientId && clientSecret ? 'ok' : 'unconfigured',
        clientId,
        clientSecret,
        redirectUri,
    };
}

export const getHealth = async (_req, res) => {
    const [db, botApi] = await Promise.all([checkDB(), checkBotAPI()]);
    const oauth = checkOAuth();
    const allOk = db.status === 'ok';
    res.status(allOk ? 200 : 503).json({
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: { db, botApi, oauth },
    });
};

// Liste des commandes du bot pour la documentation (publique, mise en cache 5 minutes)
let commandsCache = { at: 0, data: null };
const COMMANDS_TTL_MS = 5 * 60 * 1000;

export const getCommands = async (_req, res) => {
    if (commandsCache.data && Date.now() - commandsCache.at < COMMANDS_TTL_MS) {
        return res.json(commandsCache.data);
    }
    const baseUrl = (process.env.BOT_API_URL || '').trim().replace(/\/+$/, '');
    if (!baseUrl) return res.status(503).json({ error: 'Bot API non configurée' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.BOT_API_TIMEOUT_MS || 5000));
    try {
        const headers = { Accept: 'application/json' };
        if (process.env.BOT_API_TOKEN) headers['x-dashboard-token'] = process.env.BOT_API_TOKEN;
        const response = await fetch(`${baseUrl}/commands`, { headers, signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        commandsCache = { at: Date.now(), data };
        return res.json(data);
    } catch (error) {
        // Le bot ne répond pas : on sert la dernière liste connue plutôt qu'une erreur
        if (commandsCache.data) return res.json(commandsCache.data);
        return res.status(502).json({ error: 'Liste des commandes indisponible', details: process.env.NODE_ENV === 'production' ? undefined : error.message });
    } finally {
        clearTimeout(timeout);
    }
};

// --- Activité Discord (/activite) : vidéo demandée avec /lecture video, ou La Mecque en direct ---
function botRequest(path, signal) {
    const baseUrl = (process.env.BOT_API_URL || '').trim().replace(/\/+$/, '');
    if (!baseUrl) throw new Error('Bot API non configurée');
    const headers = {};
    if (process.env.BOT_API_TOKEN) headers['x-dashboard-token'] = process.env.BOT_API_TOKEN;
    return fetch(`${baseUrl}${path}`, { headers, signal });
}

export const getActivity = async (req, res) => {
    const { channelId } = req.params;
    if (!/^\d{5,25}$/.test(channelId)) return res.status(400).json({ error: 'Salon invalide' });
    try {
        // La recherche YouTube peut prendre quelques secondes
        const response = await botRequest(`/activity/${channelId}`, AbortSignal.timeout(45000));
        const data = await response.json();
        return res.status(response.ok ? 200 : 502).json(data);
    } catch {
        return res.json({ type: 'mecque' });
    }
};

// Flux vidéo relayé depuis le bot (le bot seul peut lire YouTube : les adresses sont liées à son IP)
export const streamYoutubeVideo = async (req, res) => {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return res.status(400).json({ error: 'Vidéo invalide' });
    const controller = new AbortController();
    req.on('close', () => controller.abort());
    try {
        const response = await botRequest(`/media/youtube/${id}/video`, controller.signal);
        if (!response.ok || !response.body) return res.status(response.status || 502).json({ error: 'Vidéo indisponible' });
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Cache-Control', 'no-store');
        Readable.fromWeb(response.body).on('error', () => res.end()).pipe(res);
    } catch {
        if (!res.headersSent) res.status(502).json({ error: 'Vidéo indisponible' });
    }
};

// --- Directs de La Mecque et Médine en HD (1080p) depuis Aloula, la plateforme de la télévision saoudienne ---
// L'adresse du flux est signée et expire après quelques heures : on en redemande une, gardée 30 minutes.
const ALOULA_CHANNELS = { mecque: 7, medine: 6 };
const liveCache = new Map(); // nom -> { at, url }
const LIVE_TTL_MS = 30 * 60 * 1000;

export const getLiveStream = async (req, res) => {
    const channelId = ALOULA_CHANNELS[req.params.name];
    if (!channelId) return res.status(404).json({ error: 'Direct inconnu' });
    const cached = liveCache.get(req.params.name);
    if (cached && Date.now() - cached.at < LIVE_TTL_MS) return res.json({ url: cached.url });
    try {
        const response = await fetch(`https://aloula.faulio.com/api/v1.1/channels/${channelId}/player`, { signal: AbortSignal.timeout(8000) });
        const data = await response.json();
        // Liste « direct » (quelques segments) plutôt que la liste DVR de 4 h, trop lourde à recharger toutes les 4 s
        const url = typeof data?.streams?.hls === 'string' ? data.streams.hls.replace('/playlist_dvr.m3u8', '/playlist.m3u8') : null;
        if (!response.ok || typeof url !== 'string' || !url.startsWith('https://live.kwikmotion.com/')) throw new Error('Flux absent');
        liveCache.set(req.params.name, { at: Date.now(), url });
        return res.json({ url });
    } catch {
        return res.status(502).json({ error: 'Direct HD indisponible' });
    }
};
