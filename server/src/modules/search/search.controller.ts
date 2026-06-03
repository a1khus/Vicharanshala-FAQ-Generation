import { Request, Response } from 'express';
import { Question } from '../../models/Question';
import { SearchLog, UnansweredSearch } from '../../models/SearchLog';
import { successResponse, getPagination, buildPaginationMeta } from '../../utils/helpers';
import { AppError } from '../../middlewares/error.middleware';

type SearchCandidate = Record<string, unknown> & { score?: number };

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stopWords = new Set(['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'of']);

const buildRelevanceScore = (question: any, tokens: string[], queryLower: string, textScore = 0) => {
  // textScore from MongoDB is usually small (0.5 to 5), but highly relevant
  let score = textScore * 500;
  
  const title = String(question.title || '').toLowerCase();
  const description = String(question.description || '').toLowerCase();
  const tags: string[] = Array.isArray(question.tags)
    ? question.tags.map((tag: unknown) => String(tag).toLowerCase())
    : [];

  // Filter out stop words from tokens to focus on meaning
  const meaningfulTokens = tokens.filter(t => !stopWords.has(t));
  const tokensToScore = meaningfulTokens.length > 0 ? meaningfulTokens : tokens;

  // Massive boost for exact full query match
  if (title.includes(queryLower)) score += 5000;
  if (description.includes(queryLower)) score += 2000;

  let matchedTokens = 0;

  tokensToScore.forEach((token) => {
    let matched = false;
    
    // Exact word matches give massive points
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(token)}\\b`, 'i');
    
    if (wordBoundaryRegex.test(title)) {
      score += 1000;
      matched = true;
    } else if (title.includes(token)) {
      score += 300;
      matched = true;
    }
    
    if (wordBoundaryRegex.test(description)) {
      score += 400;
      matched = true;
    } else if (description.includes(token)) {
      score += 100;
      matched = true;
    }

    if (tags.some((tag) => tag === token)) {
      score += 800;
      matched = true;
    } else if (tags.some((tag) => tag.includes(token))) {
      score += 200;
      matched = true;
    }
    
    if (matched) matchedTokens++;
  });

  // Severe penalty if NO meaningful tokens matched the text
  // This prevents highly popular but irrelevant results from floating to the top
  if (matchedTokens === 0 && score < 100) {
    return 0; // Irrelevant
  }

  // Cap popularity metrics so they only act as a tie-breaker, not the main driver
  const popularityScore = 
    ((question.trendingScore ?? 0) * 1) + 
    ((question.searchClickCount ?? 0) * 2) + 
    ((question.answerCount ?? 0) * 5) + 
    ((question.voteScore ?? 0) * 1);
    
  // Add capped popularity (max 1000 points)
  score += Math.min(popularityScore, 1000);

  return score;
};

// ─── Full-text search ─────────────────────────────────────────────────────────
export const search = async (req: Request, res: Response): Promise<void> => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    res.json(successResponse([], 'No query provided'));
    return;
  }

  const { page, limit, skip } = getPagination(req.query);
  const queryLower = query.toLowerCase();
  const tokens = queryLower.split(/\s+/).filter(Boolean);
  const tokenRegex = new RegExp(tokens.map(escapeRegex).join('|'), 'i');

  // Log the search
  const searchLog = new SearchLog({ query: queryLower, userId: req.user?.userId ?? null });

  const filterBase: Record<string, unknown> = {
    status: { $ne: 'deleted' },
  };
  
  if (req.query.category) filterBase.category = req.query.category;

  const total = await Question.countDocuments(filterBase);
  const candidateLimit = Math.min(Math.max(limit * 5, 100), Math.max(total, 100));

  let rawResults: SearchCandidate[] = [];
  
  try {
    const textFilter = { ...filterBase, $text: { $search: query } };
    rawResults = (await Question.find(textFilter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, trendingScore: -1 })
      .limit(candidateLimit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color icon')
      .lean()) as SearchCandidate[];
  } catch (err) {
    // Ignore text index errors
  }

  if (rawResults.length < candidateLimit) {
    const regexFilter: any = {
      ...filterBase,
      $or: [
        { title: tokenRegex },
        { description: tokenRegex },
        { tags: tokenRegex },
      ],
    };
    
    if (rawResults.length > 0) {
      regexFilter._id = { $nin: rawResults.map(r => r._id) };
    }

    const extraResults = (await Question.find(regexFilter)
      .sort({ trendingScore: -1 })
      .limit(candidateLimit - rawResults.length)
      .populate('author', 'username avatar')
      .populate('category', 'name slug color icon')
      .lean()) as SearchCandidate[];

    rawResults = [...rawResults, ...extraResults];
  }

  const ranked: Array<SearchCandidate & { relevanceScore: number }> = rawResults
    .map((result) => ({
      ...result,
      relevanceScore: buildRelevanceScore(result, tokens, queryLower, Number(result.score ?? 0)),
    }))
    .sort((a, b) => (b.relevanceScore as number) - (a.relevanceScore as number));

  const results = ranked.slice(skip, skip + limit).map(({ relevanceScore, ...rest }) => rest);

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
