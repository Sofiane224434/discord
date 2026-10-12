import { Router } from 'express';
import { getFeedbacks, createFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';

const router = Router();

router.get('/', getFeedbacks);
router.post('/', createFeedback);
router.patch('/:id', updateFeedbackStatus);

export default router;
