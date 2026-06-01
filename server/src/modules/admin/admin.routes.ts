import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSiteStats, getUsers, updateUserRole, deleteUser,
  adminGetQuestions, adminDeleteQuestion,
  getUnansweredSearches, getSearchAnalytics, getTopContributors,
} from './admin.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

// All admin routes require authentication + admin/moderator role
router.use(authenticate);

router.get('/stats', requireRole('admin', 'moderator'), getSiteStats);
router.get('/contributors', getTopContributors);

// User management (admin only)
router.get('/users', requireRole('admin'), getUsers);
router.patch(
  '/users/:id/role',
  requireRole('admin'),
  [body('role').isIn(['user', 'moderator', 'admin']).withMessage('Invalid role')],
  validateRequest,
  updateUserRole
);
router.delete('/users/:id', requireRole('admin'), deleteUser);

// Question moderation
router.get('/questions', requireRole('admin', 'moderator'), adminGetQuestions);
router.delete('/questions/:id', requireRole('admin', 'moderator'), adminDeleteQuestion);

// Search analytics
router.get('/unanswered-searches', requireRole('admin', 'moderator'), getUnansweredSearches);
router.get('/search-analytics', requireRole('admin', 'moderator'), getSearchAnalytics);

export default router;
