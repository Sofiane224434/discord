import { getBotOverview } from '../services/bot.service.js';

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
