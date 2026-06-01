import { Router } from 'express';
import { body } from 'express-validator';
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { Question } from '../../models/Question';
import { Answer } from '../../models/Answer';
import { AppError } from '../../middlewares/error.middleware';
import { successResponse, getPagination, buildPaginationMeta } from '../../utils/helpers';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload, getFileUrl } from '../../config/storage';
import { validateRequest } from '../../middlewares/error.middleware';

const router = Router();

// GET public profile
router.get('/:username', async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-passwordHash')
    .lean();
  if (!user) throw new AppError('User not found', 404);
  res.json(successResponse(user));
});

// GET current user's questions
router.get('/:username/questions', async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new AppError('User not found', 404);

  const { page, limit, skip } = getPagination(req.query);

  const [questions, total] = await Promise.all([
    Question.find({ author: user._id, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug color')
      .lean(),
    Question.countDocuments({ author: user._id, status: { $ne: 'deleted' } }),
  ]);

  res.json(successResponse(questions, 'Questions fetched', buildPaginationMeta(total, page, limit)));
});

// GET current user's answers
router.get('/:username/answers', async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new AppError('User not found', 404);

  const { page, limit, skip } = getPagination(req.query);

  const [answers, total] = await Promise.all([
    Answer.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('questionId', 'title')
      .lean(),
    Answer.countDocuments({ author: user._id }),
  ]);

  res.json(successResponse(answers, 'Answers fetched', buildPaginationMeta(total, page, limit)));
});

// PATCH update profile
router.patch(
  '/me',
  authenticate,
  [
    body('bio').optional().isLength({ max: 300 }),
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { bio, username } = req.body;
    const update: Record<string, string> = {};
    if (bio !== undefined) update.bio = bio;
    if (username) update.username = username;

    const user = await User.findByIdAndUpdate(req.user!.userId, update, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404);
    res.json(successResponse(user, 'Profile updated'));
  }
);

// POST upload avatar
router.post(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: Request, res: Response) => {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const avatarUrl = getFileUrl(req, req.file.filename);
    const user = await User.findByIdAndUpdate(req.user!.userId, { avatar: avatarUrl }, { new: true });
    res.json(successResponse({ avatarUrl: user?.avatar }, 'Avatar updated'));
  }
);

export default router;
