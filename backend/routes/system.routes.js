import { Router } from 'express';
import { getHealth, getCommands, getActivity, streamYoutubeVideo } from '../controllers/system.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/commands', getCommands);
// Activité Discord : contenu à afficher dans un salon vocal, et flux des vidéos demandées
router.get('/activity/:channelId', getActivity);
router.get('/youtube/:id/video', streamYoutubeVideo);

export default router;
