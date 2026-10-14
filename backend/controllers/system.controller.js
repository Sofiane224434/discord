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
