import { Router } from 'express';
import { getHealth, getCommands } from '../controllers/system.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/commands', getCommands);

export default router;
