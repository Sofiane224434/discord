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
        const res = await fetch(`${base}/health`, { signal: controller.signal });
        clearTimeout(tid);
        return { status: res.ok ? 'ok' : 'degraded' };
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
