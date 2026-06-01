import { Router } from 'express';
import { body } from 'express-validator';
import { search, getTrendingSearches, getRecentSearches, reportUnanswered } from './search.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

router.get('/', optionalAuthenticate, search);
router.get('/trending', getTrendingSearches);
router.get('/recent', authenticate, getRecentSearches);

router.post(
  '/report-unanswered',
  optionalAuthenticate,
  [body('query').trim().notEmpty().withMessage('Query is required')],
  validateRequest,
  reportUnanswered
);

export default router;
