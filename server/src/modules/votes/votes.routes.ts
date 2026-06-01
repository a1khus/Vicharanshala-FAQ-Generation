import { Router } from 'express';
import { body } from 'express-validator';
import { castVote, getUserVote } from './votes.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

const voteValidation = [
  body('value').isIn([1, -1]).withMessage('Vote value must be 1 or -1'),
];

router.post('/question/:id', authenticate, voteValidation, validateRequest, castVote('question'));
router.post('/answer/:id', authenticate, voteValidation, validateRequest, castVote('answer'));
router.get('/:targetType/:targetId', authenticate, getUserVote);

export default router;
