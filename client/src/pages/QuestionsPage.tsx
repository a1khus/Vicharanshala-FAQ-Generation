import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, EmptyState, ErrorState } from '../components/common';
import { questionsApi } from '../services/questions.service';
import { categoriesApi } from '../services/categories.service';
import type { SortOption } from '../types';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Plus, SlidersHorizontal, Grid, List, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated } = useAuthStore();

  const sort = (searchParams.get('sort') as SortOption) || 'trending';
  const category = searchParams.get('category') || undefined;

  const navigate = useNavigate();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 30 * 60 * 1000,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['questions', { sort, category, page }],
    queryFn: () => questionsApi.getAll({ sort, category, page, limit: 12 }),
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        
        {/* Fixed Left Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 space-y-6">
          
          {/* Categories Nav */}
          {categories.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-label-lg font-bold text-on-surface mb-4">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategory(undefined)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    !category ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      category === cat.slug ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-semibold transition-colors duration-200 ${
                      category === cat.slug ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-surface-variant group-hover:text-on-surface'
                    }`}>
                      {cat.questionCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort By Nav */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-label-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" /> Sort By
            </h3>
            <div className="space-y-1.5">
              {SORT_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => handleSort(value)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    sort === value
                      ? 'bg-primary-fixed text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Top Content Header */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 md:p-8 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Title & Count */}
              <div>
                <h1 className="text-3xl font-bold text-on-surface mb-2">Browse Questions</h1>
                {meta ? (
                  <p className="text-body-md text-on-surface-variant font-medium">
                    Showing <span className="text-primary">{meta.total.toLocaleString()}</span> questions
                  </p>
                ) : (
                  <p className="text-body-md text-on-surface-variant font-medium h-5"></p>
                )}
              </div>
              
              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-auto">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search questions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-11 pr-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant"
                  />
                </form>

                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  <button
                    onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                    className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Toggle view mode"
                  >
                    {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                  </button>
                  
                  {isAuthenticated ? (
                    <Link to="/questions/ask" className="btn-primary py-2.5 px-5 flex items-center gap-2 rounded-xl font-semibold shadow-sm hover:shadow transition-all">
                      <Plus size={18} /> <span className="hidden sm:inline">Ask Question</span>
                    </Link>
                  ) : (
                    <button onClick={() => navigate('/login')} className="btn-primary py-2.5 px-5 flex items-center gap-2 rounded-xl font-semibold shadow-sm hover:shadow transition-all">
                      <Plus size={18} /> <span className="hidden sm:inline">Ask Question</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Questions Grid/List */}
          <div className="min-h-[50vh]">
            {isLoading ? (
              <QuestionsGridSkeleton count={6} />
            ) : isError ? (
              <ErrorState retry={() => refetch()} />
            ) : questions.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 shadow-sm">
                <EmptyState
                  icon="help_outline"
                  title="No questions found"
                  description="Try adjusting your filters or be the first to ask a question!"
                  action={{ label: 'Ask a Question', onClick: () => isAuthenticated ? window.location.href = '/questions/ask' : navigate('/login') }}
                />
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}
                >
                  {questions.map((q) => (
                    <QuestionCard key={q._id} question={q} variant={viewMode === 'list' ? 'compact' : 'default'} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12 bg-surface-container-lowest py-4 px-6 rounded-2xl border border-outline-variant/30 shadow-sm w-fit mx-auto">
                    <button
                      disabled={!meta.hasPrevPage}
                      onClick={() => setPage(p => p - 1)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-outline-variant disabled:opacity-40 hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed text-on-surface"
                    >
                      ← Prev
                    </button>
                    <div className="text-sm font-medium text-on-surface-variant px-2 flex items-center gap-1">
                      <span>Page</span>
                      <span className="text-on-surface font-bold bg-surface-container px-2.5 py-1 rounded-lg">{meta.page}</span>
                      <span>of {meta.totalPages}</span>
                    </div>
                    <button
                      disabled={!meta.hasNextPage}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-outline-variant disabled:opacity-40 hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed text-on-surface"
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
    </div>
  );
};

export default QuestionsPage;

