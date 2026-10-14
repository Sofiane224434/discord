import { Router } from 'express';
import { getFeedbacks, createFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedback.controller.js';
import authMiddleware, { optionalAuth, requireStaff } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, getFeedbacks);
router.post('/', optionalAuth, createFeedback);
router.patch('/:id', authMiddleware, requireStaff, updateFeedbackStatus);
router.delete('/:id', authMiddleware, requireStaff, deleteFeedback);

export default router;
