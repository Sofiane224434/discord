import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getOverview, getGuildStats } from '../controllers/bot.controller.js';

const router = Router();

router.get('/overview', authMiddleware, getOverview);
router.get('/guilds/:id/stats', authMiddleware, getGuildStats);

export default router;
