import { Router } from 'express';
import { getHealth, getCommands, getActivity, controlActivity, streamYoutubeVideo, getLiveStream } from '../controllers/system.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/commands', getCommands);
// Activité Discord : contenu à afficher dans un salon vocal, et flux des vidéos demandées
router.get('/activity/:channelId', getActivity);
router.post('/activity/:channelId/control', controlActivity);
router.get('/youtube/:id/video', streamYoutubeVideo);
router.get('/live/:name', getLiveStream);

export default router;
