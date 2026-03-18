import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getOverview } from '../controllers/bot.controller.js';

const router = Router();

router.get('/overview', authMiddleware, getOverview);

export default router;
