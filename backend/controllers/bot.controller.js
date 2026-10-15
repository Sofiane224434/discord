import { getBotOverview } from '../services/bot.service.js';
import DashboardModel from '../models/dashboard.model.js';

// Serveur officiel : toujours présenté en premier dans « Autres serveurs »
const FEATURED_GUILD_ID = process.env.FEATURED_GUILD_ID || '1283533269047971894';

// Chaque personne ne reçoit que ce qui la concerne : les détails (mode Islam, statistiques, erreurs)
// des serveurs qu'elle gère, le nom et l'icône des autres, et rien des serveurs anonymes
// (seulement leur nombre). L'administration du site voit tout.
export function overviewFor(overview, user) {
    const isStaff = ['admin', 'superadmin'].includes(user?.role);
    const managed = new Set((user?.discord_guild_ids || []).map(String));
    let hiddenGuildCount = 0;
    const guilds = [];
    for (const guild of overview.guilds || []) {
        const featured = guild.id === FEATURED_GUILD_ID;
        if (isStaff || managed.has(guild.id)) {
            guilds.push({ ...guild, featured });
        } else if (guild.directoryHidden) {
            hiddenGuildCount += 1;
        } else {
            guilds.push({ id: guild.id, name: guild.name, memberCount: guild.memberCount, iconUrl: guild.iconUrl, publicInviteUrl: guild.publicInviteUrl, featured });
        }
    }
    return {
        bot: overview.bot,
        stats: overview.stats,
        ...(isStaff ? { observability: overview.observability } : {}),
        guilds,
        hiddenGuildCount,
    };
}

export const getOverview = async (req, res) => {
    try {
        const { configured, source, isStale, generatedAt, overview } = await getBotOverview();

        res.json({
            configured,
            source,
            isStale,
            generatedAt: generatedAt || new Date().toISOString(),
            ...overviewFor(overview, req.user),
        });
    } catch (error) {
        res.status(502).json({
            error: 'Impossible de recuperer les donnees du bot',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    }
};

export const getGuildStats = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Guild ID requis' });
    try {
        const history = await DashboardModel.getGuildHistory(String(id), 20);
        res.json({ guildId: id, history });
    } catch (error) {
        res.status(500).json({
            error: 'Impossible de recuperer les stats du serveur',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    }
};
