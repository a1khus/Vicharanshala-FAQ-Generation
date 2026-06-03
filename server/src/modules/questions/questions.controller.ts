import { Request, Response } from 'express';
import { Question } from '../../models/Question';
import { Category } from '../../models/Category';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/error.middleware';
import { getPagination, buildPaginationMeta, successResponse } from '../../utils/helpers';

const computeTrendingScore = (q: {
  upvotes: number;
  viewCount: number;
  clickCount: number;
  searchClickCount: number;
  answerCount: number;
  createdAt: Date;
}): number => {
  const ageInDays = (Date.now() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBonus = Math.exp(-0.1 * ageInDays); // Decay over 10 days
  // searchClickCount weighted highest — most direct "most searched" signal
  return (
    (q.upvotes * 2) +
    (q.viewCount * 0.5) +
    (q.clickCount * 1) +
    (q.searchClickCount * 3) +
    (q.answerCount * 3) +
    recencyBonus * 10
  );
};

// ─── GET all questions ────────────────────────────────────────────────────────
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  const { category, tags, sort = 'recent', status = 'open' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter: Record<string, unknown> = { status };

  // category can be a slug (e.g. "vins-about") or a raw ObjectId
  if (category) {
    const catStr = String(category);
    const isObjectId = /^[a-f\d]{24}$/i.test(catStr);
    if (isObjectId) {
      filter.category = catStr;
    } else {
      const cat = await Category.findOne({ slug: catStr }).select('_id').lean();
      if (cat) {
        filter.category = cat._id;
      } else {
        res.json(successResponse([], 'Questions fetched', buildPaginationMeta(0, page, limit)));
        return;
      }
    }
  }

  if (tags) filter.tags = { $in: String(tags).split(',') };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    recent: { createdAt: -1 },
    popular: { voteScore: -1 },
    trending: { trendingScore: -1 },
    views: { viewCount: -1 },
    unanswered: { answerCount: 1, createdAt: -1 },
  };
  const sortOption = sortMap[String(sort)] ?? sortMap.recent;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar reputation')
      .populate('category', 'name slug color icon')
      .lean(),
    Question.countDocuments(filter),
  ]);

  res.json(
    successResponse(questions, 'Questions fetched', buildPaginationMeta(total, page, limit))
  );
};

// ─── GET single question ──────────────────────────────────────────────────────
export const getQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id)
    .populate('author', 'username avatar reputation bio')
    .populate('category', 'name slug color icon');

  if (!question || question.status === 'deleted') {
    throw new AppError('Question not found', 404);
  }

  res.json(successResponse(question));
};

// ─── POST create question ─────────────────────────────────────────────────────
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  const { title, description, categoryId, tags } = req.body;
  const authorId = req.user!.userId;

  const category = await Category.findById(categoryId);
  if (!category) throw new AppError('Category not found', 404);

  const question = await Question.create({
    title,
    description,
    category: categoryId,
    tags: tags || [],
    author: authorId,
  });

  // Update category and user counts
  await Promise.all([
    Category.findByIdAndUpdate(categoryId, { $inc: { questionCount: 1 } }),
    User.findByIdAndUpdate(authorId, { $inc: { questionCount: 1 } }),
  ]);

  const populated = await question.populate([
    { path: 'author', select: 'username avatar reputation' },
    { path: 'category', select: 'name slug color icon' },
  ]);

  res.status(201).json(successResponse(populated, 'Question created'));
};

// ─── PATCH update question ────────────────────────────────────────────────────
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id);
  if (!question || question.status === 'deleted') throw new AppError('Question not found', 404);

  const isOwner = question.author.toString() === req.user!.userId;
  const isMod = ['moderator', 'admin'].includes(req.user!.role);
  if (!isOwner && !isMod) throw new AppError('Forbidden', 403);

  const { title, description, tags, status } = req.body;
  if (title) question.title = title;
  if (description) question.description = description;
  if (tags) question.tags = tags;
  if (status && isMod) question.status = status;

  await question.save();
  res.json(successResponse(question, 'Question updated'));
};

// ─── DELETE question ──────────────────────────────────────────────────────────
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id);
  if (!question) throw new AppError('Question not found', 404);

  const isOwner = question.author.toString() === req.user!.userId;
  const isMod = ['moderator', 'admin'].includes(req.user!.role);
  if (!isOwner && !isMod) throw new AppError('Forbidden', 403);

  question.status = 'deleted';
  await question.save();

  await Category.findByIdAndUpdate(question.category, { $inc: { questionCount: -1 } });

  res.json(successResponse(null, 'Question deleted'));
};

// ─── POST increment view count ────────────────────────────────────────────────
export const incrementView = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1, clickCount: 1 } },
    { new: true }
  );
  if (!question) throw new AppError('Question not found', 404);

  // Update trending score async
  question.trendingScore = computeTrendingScore(question);
  await question.save();

  res.json(successResponse({ viewCount: question.viewCount }));
};

// ─── POST record search click ─────────────────────────────────────────────────
export const recordSearchClick = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1, clickCount: 1, searchClickCount: 1 } },
    { new: true }
  );
  if (!question) throw new AppError('Question not found', 404);

  // Update trending score with new searchClickCount
  question.trendingScore = computeTrendingScore(question);
  await question.save();

  res.json(successResponse({ viewCount: question.viewCount, searchClickCount: question.searchClickCount }));
};

// ─── GET trending questions ───────────────────────────────────────────────────
export const getTrending = async (_req: Request, res: Response): Promise<void> => {
  const questions = await Question.find({ status: 'open' })
    .sort({ trendingScore: -1 })
    .limit(10)
    .populate('author', 'username avatar')
    .populate('category', 'name slug color icon')
    .lean();

  res.json(successResponse(questions));
};

// ─── GET most-searched questions ──────────────────────────────────────────────
export const getMostSearched = async (_req: Request, res: Response): Promise<void> => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

  // Step 1: Get top search queries from the last 7 days
  const { SearchLog } = await import('../../models/SearchLog');
  const topQueries = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: since }, resultsCount: { $gt: 0 } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  if (topQueries.length === 0) {
    // Fallback: return questions with highest searchClickCount
    const fallback = await Question.find({ status: 'open' })
      .sort({ searchClickCount: -1, trendingScore: -1 })
      .limit(6)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color icon')
      .lean();
    res.json(successResponse(fallback.map((q) => ({ ...q, searchCount: q.searchClickCount }))));
    return;
  }

  // Step 2: Full-text search questions matching top queries
  // Build a combined search string from top queries
  const searchString = topQueries.map((q: { _id: string }) => q._id).join(' ');

  // Create a map for query → count
  const queryCountMap: Record<string, number> = {};
  for (const q of topQueries) {
    queryCountMap[String(q._id)] = q.count as number;
  }

  // Find matching questions using text search
  const candidates = await Question.find(
    { $text: { $search: searchString }, status: 'open' },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, trendingScore: -1 })
    .limit(20)
    .populate('author', 'username avatar')
    .populate('category', 'name slug color icon')
    .lean();

  // Step 3: Score each question by how well it matches the top queries
  const scored = candidates.map((q) => {
    const titleLower = q.title.toLowerCase();
    let searchScore = 0;
    for (const { _id: queryWord, count } of topQueries) {
      if (titleLower.includes(String(queryWord))) {
        searchScore += (count as number);
      }
    }
    const finalScore = searchScore * 3 + q.trendingScore + (q.searchClickCount ?? 0) * 5;
    return { ...q, searchCount: searchScore + (q.searchClickCount ?? 0), _finalScore: finalScore };
  });

  // Sort by final score desc, deduplicate, return top 6
  scored.sort((a, b) => b._finalScore - a._finalScore);
  const seen = new Set<string>();
  const results = [];
  for (const q of scored) {
    const id = String(q._id);
    if (!seen.has(id)) {
      seen.add(id);
      results.push(q);
    }
    if (results.length >= 6) break;
  }

  // Pad if < 6
  if (results.length < 6) {
    const existingIds = results.map(r => r._id);
    const fallback = await Question.find({ status: 'open', _id: { $nin: existingIds } })
      .sort({ searchClickCount: -1, trendingScore: -1, voteScore: -1 })
      .limit(6 - results.length)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color icon')
      .lean();
    for (const q of fallback) {
      results.push({ ...q, searchCount: q.searchClickCount, _finalScore: 0 });
    }
  }

  res.json(successResponse(results));
};

// ─── GET popular questions ────────────────────────────────────────────────────
export const getPopular = async (_req: Request, res: Response): Promise<void> => {
  const questions = await Question.find({ status: 'open' })
    .sort({ voteScore: -1, viewCount: -1 })
    .limit(10)
    .populate('author', 'username avatar')
    .populate('category', 'name slug color icon')
    .lean();

  res.json(successResponse(questions));
};

// ─── GET related questions ────────────────────────────────────────────────────
export const getRelated = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id).lean();
  if (!question) throw new AppError('Question not found', 404);

  const related = await Question.find({
    _id: { $ne: question._id },
    status: 'open',
    $or: [
      { category: question.category },
      { tags: { $in: question.tags } },
    ],
  })
    .sort({ trendingScore: -1 })
    .limit(5)
    .populate('author', 'username avatar')
    .populate('category', 'name slug color icon')
    .lean();

  res.json(successResponse(related));
};
