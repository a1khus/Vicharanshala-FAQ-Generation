import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { categoriesApi } from '../services/categories.service';
import { questionsApi } from '../services/questions.service';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, EmptyState } from '../components/common';

const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const cat = catData?.data;

  const { data, isLoading } = useQuery({
    queryKey: ['questions', { category: cat?._id }],
    queryFn: () => questionsApi.getAll({ category: cat?._id, sort: 'recent' }),
    enabled: !!cat?._id,
  });

  const questions = data?.data ?? [];

  return (
    <div className="page-container py-12">
      {cat && (
        <div className="mb-10 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: `${cat.color}22` }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ color: cat.color }}>{cat.icon}</span>
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">{cat.name}</h1>
            <p className="text-body-md text-on-surface-variant">
              {cat.description || `Browse all ${cat.name} questions`} · {cat.questionCount} questions
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <QuestionsGridSkeleton count={6} />
      ) : questions.length === 0 ? (
        <EmptyState icon="help_outline" title="No questions yet" description="Be the first to ask a question in this category." />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {questions.map((q) => (
            <QuestionCard key={q._id} question={q} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
