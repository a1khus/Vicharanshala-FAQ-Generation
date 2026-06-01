// ─── Core Types ───────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  bio?: string;
  reputation: number;
  questionCount: number;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  author: User;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  viewCount: number;
  clickCount: number;
  searchClickCount: number;
  answerCount: number;
  trendingScore: number;
  searchCount?: number; // composite search popularity score (returned by most-searched API)
  status: 'open' | 'closed' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  _id: string;
  questionId: string;
  content: string;
  author: User;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult extends Question {}

export interface TrendingSearch {
  query: string;
  count: number;
}

export interface UnansweredSearch {
  _id: string;
  query: string;
  count: number;
  createdAt: string;
}

export interface SiteStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalVotes: number;
  totalSearches: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
}

export interface QuestionForm {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
}

export interface AnswerForm {
  content: string;
  questionId: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type SortOption = 'recent' | 'popular' | 'trending' | 'views' | 'unanswered';

export interface QuestionFilters {
  category?: string;
  tags?: string[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}
