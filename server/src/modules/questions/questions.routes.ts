import { Router } from 'express';
import { body } from 'express-validator';
import {
  getQuestions, getQuestion, createQuestion, updateQuestion,
  deleteQuestion, incrementView, getTrending, getPopular, getRelated,
  getMostSearched, recordSearchClick,
} from './questions.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/most-searched', getMostSearched);

router.get('/', optionalAuthenticate, getQuestions);
router.get('/:id', optionalAuthenticate, getQuestion);
router.get('/:id/related', getRelated);
router.post('/:id/view', incrementView);
router.post('/:id/search-click', recordSearchClick);

router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 10, max: 300 }).withMessage('Title must be 10-300 characters'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('categoryId').isMongoId().withMessage('Valid category ID required'),
    body('tags').optional().isArray({ max: 5 }).withMessage('Maximum 5 tags allowed'),
  ],
  validateRequest,
  createQuestion
);

router.patch(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 10, max: 300 }),
    body('description').optional().trim().isLength({ min: 20 }),
    body('tags').optional().isArray({ max: 5 }),
  ],
  validateRequest,
  updateQuestion
);

router.delete('/:id', authenticate, deleteQuestion);

export default router;
