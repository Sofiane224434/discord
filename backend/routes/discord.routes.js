import { Router } from 'express';
import { getAuthUrl, exchangeCode } from '../controllers/discord.controller.js';

const router = Router();

router.get('/url', getAuthUrl);
router.post('/exchange', exchangeCode);

export default router;
