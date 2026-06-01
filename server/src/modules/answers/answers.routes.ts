import { Router } from 'express';
import { body } from 'express-validator';
import { getAnswers, createAnswer, updateAnswer, deleteAnswer, acceptAnswer } from './answers.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

router.get('/question/:questionId', getAnswers);

router.post(
  '/',
  authenticate,
  [
    body('questionId').isMongoId().withMessage('Valid question ID required'),
    body('content').trim().isLength({ min: 20 }).withMessage('Answer must be at least 20 characters'),
  ],
  validateRequest,
  createAnswer
);

router.patch(
  '/:id',
  authenticate,
  [body('content').optional().trim().isLength({ min: 20 })],
  validateRequest,
  updateAnswer
);

router.delete('/:id', authenticate, deleteAnswer);
router.post('/:id/accept', authenticate, acceptAnswer);

export default router;
