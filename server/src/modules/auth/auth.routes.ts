import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, logout, refreshToken, getMe } from './auth.controller';
import { validateRequest } from '../../middlewares/error.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  login
);

router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

export default router;
