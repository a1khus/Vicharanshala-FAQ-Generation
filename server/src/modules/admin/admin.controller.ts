import { Request, Response } from 'express';
import { User } from '../../models/User';
import { Question } from '../../models/Question';
import { Answer } from '../../models/Answer';
import { SearchLog, UnansweredSearch } from '../../models/SearchLog';
import { Category } from '../../models/Category';
import { Vote } from '../../models/Vote';
import { AppError } from '../../middlewares/error.middleware';
import { successResponse, getPagination, buildPaginationMeta } from '../../utils/helpers';

// ─── Site statistics ──────────────────────────────────────────────────────────
export const getSiteStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalUsers,
    totalQuestions,
    totalAnswers,
    totalVotes,
    totalSearches,
  ] = await Promise.all([
    User.countDocuments(),
    Question.countDocuments({ status: 'open' }),
    Answer.countDocuments(),
    Vote.countDocuments(),
    SearchLog.countDocuments(),
  ]);

  res.json(successResponse({ totalUsers, totalQuestions, totalAnswers, totalVotes, totalSearches }));
};

// ─── User management ──────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { username: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json(successResponse(users, 'Users fetched', buildPaginationMeta(total, page, limit)));
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  res.json(successResponse(user, 'Role updated'));
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json(successResponse(null, 'User deleted'));
};

// ─── Question moderation ──────────────────────────────────────────────────────
export const adminGetQuestions = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) filter.$text = { $search: String(search) };

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username email')
      .populate('category', 'name')
      .lean(),
    Question.countDocuments(filter),
  ]);

  res.json(successResponse(questions, 'Questions fetched', buildPaginationMeta(total, page, limit)));
};

export const adminDeleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findByIdAndUpdate(req.params.id, { status: 'deleted' }, { new: true });
  if (!question) throw new AppError('Question not found', 404);
  res.json(successResponse(null, 'Question removed'));
};

// ─── Unanswered search reports ────────────────────────────────────────────────
export const getUnansweredSearches = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query);

  const [searches, total] = await Promise.all([
    UnansweredSearch.find().sort({ count: -1 }).skip(skip).limit(limit).lean(),
    UnansweredSearch.countDocuments(),
  ]);

  res.json(successResponse(searches, 'Unanswered searches', buildPaginationMeta(total, page, limit)));
};

// ─── Search analytics ─────────────────────────────────────────────────────────
export const getSearchAnalytics = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(String(req.query.days || '7'), 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [topQueries, dailyCounts] = await Promise.all([
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 }, avgResults: { $avg: '$resultsCount' } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { query: '$_id', count: 1, avgResults: 1, _id: 0 } },
    ]),
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json(successResponse({ topQueries, dailyCounts }));
};

// ─── Top contributors ─────────────────────────────────────────────────────────
export const getTopContributors = async (_req: Request, res: Response): Promise<void> => {
  const contributors = await User.find()
    .sort({ reputation: -1 })
    .limit(10)
    .select('username avatar reputation questionCount answerCount')
    .lean();

  res.json(successResponse(contributors));
};
