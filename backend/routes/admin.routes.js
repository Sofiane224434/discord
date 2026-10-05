import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getGuildConfig,
    updateGuildConfig,
    activateIslamMode,
} from '../controllers/admin.controller.js';

const router = Router();

// Toutes les routes admin nécessitent authentification + permission Manage Guild
router.get('/guild/:guildId/config', authMiddleware, getGuildConfig);
router.put('/guild/:guildId/config', authMiddleware, updateGuildConfig);
router.post('/guild/:guildId/islam-mode', authMiddleware, activateIslamMode);

export default router;
