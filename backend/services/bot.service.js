import DashboardModel from '../models/dashboard.model.js';

const BOT_OVERVIEW_PATH = '/dashboard/overview';
const BOT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS || 5000);

function getBaseUrl() {
    const raw = process.env.BOT_API_URL || '';
    return raw.trim().replace(/\/+$/, '');
}

function normalizeOverview(payload = {}) {
    const stats = payload.stats || {};
    const bot = payload.bot || {};
    const observability = payload.observability || {};
    const commandByName = (observability.commandByName && typeof observability.commandByName === 'object')
        ? observability.commandByName
        : {};
    const topCommands = Object.entries(commandByName)
        .map(([name, count]) => ({ name, count: Number(count || 0) }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        bot: {
            name: bot.name || 'Discord Bot',
            status: bot.status || 'offline',
            uptime: Number(bot.uptime || 0),
            latency: Number(bot.latency || 0),
            connectedAt: bot.connectedAt || null,
        },
        stats: {
            guildCount: Number(stats.guildCount || 0),
            memberCount: Number(stats.memberCount || 0),
            commandCount24h: Number(stats.commandCount24h || 0),
            activeUsers24h: Number(stats.activeUsers24h || 0),
            errorTotal: Number(stats.errorTotal || observability.errorTotal || 0),
        },
        observability: {
            errorTotal: Number(observability.errorTotal || 0),
            errorByType: (observability.errorByType && typeof observability.errorByType === 'object')
                ? observability.errorByType
                : {},
            topCommands,
        },
        guilds: Array.isArray(payload.guilds)
            ? payload.guilds.map((guild) => ({
                id: String(guild.id || ''),
                name: guild.name || 'Serveur inconnu',
                memberCount: Number(guild.memberCount || 0),
                iconUrl: guild.iconUrl || null,
            }))
            : [],
    };
}

async function getCachedOverview() {
    try {
        const cached = await DashboardModel.getLatestOverview();
        if (!cached) {
            return null;
        }

        return {
            bot: cached.bot,
            stats: cached.stats,
            guilds: cached.guilds,
            generatedAt: cached.generatedAt,
        };
    } catch {
        return null;
    }
}

function getDefaultOverview() {
    return {
        bot: {
            name: 'Discord Bot',
            status: 'offline',
            uptime: 0,
            latency: 0,
            connectedAt: null,
        },
        stats: {
            guildCount: 0,
            memberCount: 0,
            commandCount24h: 0,
            activeUsers24h: 0,
            errorTotal: 0,
        },
        observability: {
            errorTotal: 0,
            errorByType: {},
            topCommands: [],
        },
        guilds: [],
    };
}

export async function getBotOverview() {
    const baseUrl = getBaseUrl();

    if (!baseUrl) {
        const cachedOverview = await getCachedOverview();

        if (cachedOverview) {
            return {
                configured: false,
                source: 'cache',
                isStale: true,
                generatedAt: cachedOverview.generatedAt,
                overview: cachedOverview,
            };
        }

        return {
            configured: false,
            source: 'defaults',
            isStale: true,
            generatedAt: new Date().toISOString(),
            overview: getDefaultOverview(),
        };
    }

    const token = process.env.BOT_API_TOKEN;
    const url = `${baseUrl}${BOT_OVERVIEW_PATH}`;
    const headers = { Accept: 'application/json' };

    if (token) {
        headers['x-dashboard-token'] = token;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Bot API responded with status ${response.status}`);
        }

        const payload = await response.json();
        const overview = normalizeOverview(payload);

        await DashboardModel.saveOverview(overview, 'api');

        return {
            configured: true,
            source: 'api',
            isStale: false,
            generatedAt: new Date().toISOString(),
            overview,
        };
    } catch (error) {
        const cachedOverview = await getCachedOverview();

        if (cachedOverview) {
            return {
                configured: true,
                source: 'cache',
                isStale: true,
                generatedAt: cachedOverview.generatedAt,
                overview: cachedOverview,
            };
        }

        return {
            configured: true,
            source: 'defaults',
            isStale: true,
            generatedAt: new Date().toISOString(),
            overview: getDefaultOverview(),
            error: error?.message,
        };
    } finally {
        clearTimeout(timeout);
    }
}
