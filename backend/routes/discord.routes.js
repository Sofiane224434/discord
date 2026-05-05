import { Router } from 'express';
import { getAuthUrl, exchangeCode, getBotInviteUrl } from '../controllers/discord.controller.js';

const router = Router();

router.get('/url', getAuthUrl);
router.post('/exchange', exchangeCode);
router.get('/bot-invite', getBotInviteUrl);

export default router;
