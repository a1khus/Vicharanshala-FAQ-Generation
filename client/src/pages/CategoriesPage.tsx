import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { categoriesApi } from '../services/categories.service';
import { CategoryCardSkeleton, EmptyState } from '../components/common';

const CategoriesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 30 * 60 * 1000,
  });

  const categories = data?.data ?? [];

  return (
    <div className="page-container py-12">
      <div className="mb-10">
        <h1 className="text-headline-lg font-bold text-on-surface mb-2">Browse Categories</h1>
        <p className="text-body-md text-on-surface-variant">Explore questions organized by topic.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon="category" title="No categories yet" description="Categories will appear here once created by admins." />
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
            >
              <Link
                to={`/categories/${cat.slug}`}
                className="block bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer group text-center"
                style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.12)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${cat.color}22` }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>{cat.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-on-surface-variant">
                  {cat.questionCount} {cat.questionCount === 1 ? 'question' : 'questions'}
                </p>
                {cat.description && (
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CategoriesPage;
