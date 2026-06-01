import { Request, Response } from 'express';
import { Question } from '../../models/Question';
import { SearchLog, UnansweredSearch } from '../../models/SearchLog';
import { successResponse, getPagination, buildPaginationMeta } from '../../utils/helpers';
import { AppError } from '../../middlewares/error.middleware';

// ─── Full-text search ─────────────────────────────────────────────────────────
export const search = async (req: Request, res: Response): Promise<void> => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    res.json(successResponse([], 'No query provided'));
    return;
  }

  const { page, limit, skip } = getPagination(req.query);

  // Log the search
  const searchLog = new SearchLog({ query: query.toLowerCase(), userId: req.user?.userId ?? null });

  const filter: Record<string, unknown> = {
    $text: { $search: query },
    status: 'open',
  };

  // Optional category filter
  if (req.query.category) filter.category = req.query.category;

  const [results, total] = await Promise.all([
    Question.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, trendingScore: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color icon')
      .lean(),
    Question.countDocuments(filter),
  ]);

  // Update log with result count and save
  searchLog.resultsCount = total;
  await searchLog.save().catch(() => {}); // Non-blocking

  res.json(successResponse(results, 'Search results', buildPaginationMeta(total, page, limit)));
};

// ─── Trending search queries ──────────────────────────────────────────────────
export const getTrendingSearches = async (_req: Request, res: Response): Promise<void> => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

  const trending = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { query: '$_id', count: 1, _id: 0 } },
  ]);

  res.json(successResponse(trending));
};

// ─── Recent searches for logged-in user ──────────────────────────────────────
export const getRecentSearches = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.json(successResponse([]));
    return;
  }

  const recent = await SearchLog.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('query createdAt')
    .lean();

  // Deduplicate by query
  const seen = new Set<string>();
  const unique = recent.filter((s) => {
    if (seen.has(s.query)) return false;
    seen.add(s.query);
    return true;
  });

  res.json(successResponse(unique));
};

// ─── Report an unanswered search ──────────────────────────────────────────────
export const reportUnanswered = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.body;
  if (!query?.trim()) throw new AppError('Query is required', 400);

  const normalised = query.trim().toLowerCase();
  const userId = req.user?.userId;

  const existing = await UnansweredSearch.findOne({ query: normalised });

  if (existing) {
    if (userId && !existing.reportedBy.some((id) => id.toString() === userId)) {
      existing.reportedBy.push(userId as unknown as import('mongoose').Types.ObjectId);
      existing.count += 1;
      await existing.save();
    }
    res.json(successResponse(existing, 'Report updated'));
  } else {
    const report = await UnansweredSearch.create({
      query: normalised,
      reportedBy: userId ? [userId] : [],
    });
    res.status(201).json(successResponse(report, 'Search reported'));
  }
};
