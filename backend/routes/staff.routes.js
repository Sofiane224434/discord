import { Router } from 'express';
import authMiddleware, { requireStaff, requireSuperAdmin } from '../middlewares/auth.middleware.js';
import { listUsers, setUserBan, setUserRole, listGuilds, setGuildSuspended } from '../controllers/staff.controller.js';

const router = Router();

// Administration du site : admins et super administrateur
router.use(authMiddleware, requireStaff);

router.get('/users', listUsers);
router.patch('/users/:id/ban', setUserBan);
router.patch('/users/:id/role', requireSuperAdmin, setUserRole);
router.get('/guilds', listGuilds);
router.post('/guilds/:guildId/suspend', setGuildSuspended);

export default router;
