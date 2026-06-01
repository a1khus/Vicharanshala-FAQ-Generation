import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, EmptyState, ErrorState } from '../components/common';
import { questionsApi } from '../services/questions.service';
import { categoriesApi } from '../services/categories.service';
import type { SortOption } from '../types';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Plus, SlidersHorizontal, Grid, List } from 'lucide-react';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'trending', label: 'Trending', icon: 'trending_up' },
  { value: 'recent', label: 'Recent', icon: 'schedule' },
  { value: 'popular', label: 'Most Voted', icon: 'military_tech' },
  { value: 'views', label: 'Most Viewed', icon: 'visibility' },
  { value: 'unanswered', label: 'Unanswered', icon: 'help_outline' },
];

const QuestionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUiStore();

  const sort = (searchParams.get('sort') as SortOption) || 'trending';
  const category = searchParams.get('category') || undefined;

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 30 * 60 * 1000,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['questions', { sort, category, page }],
    queryFn: () => questionsApi.getAll({ sort, category, page, limit: 9 }),
  });

  const questions = data?.data ?? [];
  const meta = data?.meta;
  const categories = catData?.data ?? [];

  const handleSort = (s: SortOption) => {
    setPage(1);
    setSearchParams((prev) => { prev.set('sort', s); return prev; });
  };

  const handleCategory = (slug?: string) => {
    setPage(1);
    setSearchParams((prev) => {
      if (slug) prev.set('category', slug);
      else prev.delete('category');
      return prev;
    });
  };

  return (
    <div className="page-container py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-1">Browse Questions</h1>
          {meta && (
            <p className="text-body-md text-on-surface-variant">
              {meta.total.toLocaleString()} questions found
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>
          {isAuthenticated ? (
            <Link to="/questions/ask" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <Plus size={16} /> Ask Question
            </Link>
          ) : (
            <button onClick={() => openAuthModal('login')} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <Plus size={16} /> Ask Question
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* Sort */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 mb-4">
            <h3 className="text-label-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Sort By
            </h3>
            <div className="space-y-1">
              {SORT_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => handleSort(value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    sort === value
                      ? 'bg-primary-fixed text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4">
              <h3 className="text-label-md font-bold text-on-surface mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategory(undefined)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !category ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      category === cat.slug ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-xs bg-surface-container px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {cat.questionCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Questions Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <QuestionsGridSkeleton count={6} />
          ) : isError ? (
            <ErrorState retry={() => refetch()} />
          ) : questions.length === 0 ? (
            <EmptyState
              icon="help_outline"
              title="No questions found"
              description="Be the first to ask a question in this category."
              action={{ label: 'Ask a Question', onClick: () => isAuthenticated ? window.location.href = '/questions/ask' : openAuthModal('login') }}
            />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}
              >
                {questions.map((q) => (
                  <QuestionCard key={q._id} question={q} variant={viewMode === 'list' ? 'compact' : 'default'} />
                ))}
              </motion.div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={!meta.hasPrevPage}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-outline-variant disabled:opacity-40 hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-on-surface-variant px-2">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    disabled={!meta.hasNextPage}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-outline-variant disabled:opacity-40 hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
