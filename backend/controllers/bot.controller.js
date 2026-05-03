import { getBotOverview } from '../services/bot.service.js';
import DashboardModel from '../models/dashboard.model.js';

export const getOverview = async (_req, res) => {
    try {
        const { configured, source, isStale, generatedAt, overview } = await getBotOverview();

        res.json({
            configured,
            source,
            isStale,
            generatedAt: generatedAt || new Date().toISOString(),
            ...overview,
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
