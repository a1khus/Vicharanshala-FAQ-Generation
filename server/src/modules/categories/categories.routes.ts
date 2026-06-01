import { Router } from 'express';
import { body } from 'express-validator';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from './categories.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategory);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')],
  validateRequest,
  createCategory
);

router.patch('/:id', authenticate, requireRole('admin', 'moderator'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
