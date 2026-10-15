import { Router } from 'express';
import { getFeedbacks, createFeedback, updateFeedbackStatus, deleteFeedback, getFeedbackNotifications, markFeedbackSeen } from '../controllers/feedback.controller.js';
import authMiddleware, { optionalAuth, requireStaff } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, getFeedbacks);
// Pastille de l'en-tête : réponses de l'équipe pas encore vues
router.get('/notifications', authMiddleware, getFeedbackNotifications);
router.post('/notifications/seen', authMiddleware, markFeedbackSeen);
router.post('/', optionalAuth, createFeedback);
router.patch('/:id', authMiddleware, requireStaff, updateFeedbackStatus);
router.delete('/:id', authMiddleware, requireStaff, deleteFeedback);

export default router;
