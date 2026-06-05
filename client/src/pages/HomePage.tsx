import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, BookOpen } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, SectionHeader, StatBadge } from '../components/common';
import { questionsApi } from '../services/questions.service';
import { adminApi } from '../services/admin.service';
import { useAuthStore } from '../store/authStore';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: mostSearchedData, isLoading: mostSearchedLoading } = useQuery({
    queryKey: ['questions', 'most-searched'],
    queryFn: questionsApi.getMostSearched,
    staleTime: 0,
  });

  const { data: statsData } = useQuery({
    queryKey: ['site-stats'],
    queryFn: adminApi.getStats,
    staleTime: 10 * 60 * 1000,
  });

  const mostSearched = mostSearchedData?.data ?? [];
  const stats = statsData?.data;

  const handleAskQuestion = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    window.location.href = '/questions/ask';
  };

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="page-container py-24 md:py-32 flex flex-col items-center text-center">


        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-headline-lg-mobile md:text-display-lg font-bold text-on-surface max-w-3xl mb-6 tracking-tight text-balance"
        >
          Find Answers.{' '}
          <br />
          <span className="text-primary">Build Knowledge Together.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-body-lg text-on-surface-variant max-w-2xl mb-12"
        >
          The intelligent, community-driven FAQ platform. Search our massive database or ask a new question to tap into collective wisdom.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-2xl mb-10"
        >
          <SearchBar size="lg" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleAskQuestion}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Ask a Question
          </button>
          <Link to="/questions" className="btn-secondary flex items-center gap-2">
            <BookOpen size={18} />
            Browse FAQs
          </Link>
        </motion.div>
      </section>

      {/* ─── Stats Bar ─── */}
      {stats && (
        <section className="bg-surface-container-low border-y border-outline-variant/30 py-8">
          <div className="page-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBadge label="Questions" value={stats.totalQuestions.toLocaleString()} icon="help_outline" />
              <StatBadge label="Answers" value={stats.totalAnswers.toLocaleString()} icon="question_answer" />
              <StatBadge label="Community Members" value={stats.totalUsers.toLocaleString()} icon="group" />
              <StatBadge label="Total Votes" value={stats.totalVotes.toLocaleString()} icon="thumb_up" />
            </div>
          </div>
        </section>
      )}

      {/* ─── Popular Right Now ─── */}
      <section className="page-container py-16">
        <SectionHeader
          icon="trending_up"
          title="Popular Right Now"
          action={{ label: 'View all', to: '/questions?sort=trending' }}
        />

        {mostSearchedLoading ? (
          <QuestionsGridSkeleton count={3} />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mostSearched.slice(0, 3).map((q) => (
              <motion.div key={q._id} variants={item} className="h-full">
                <QuestionCard question={q} showSearchBadge />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ─── Most Voted ─── */}
      <section className="page-container pb-16">
        <PopularSection />
      </section>
    </div>
  );
};

const PopularSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['questions', 'popular'],
    queryFn: questionsApi.getPopular,
    staleTime: 0,
  });
  const popular = data?.data ?? [];

  return (
    <>
      <SectionHeader
        icon="military_tech"
        title="Most Voted"
        action={{ label: 'View all', to: '/questions?sort=popular' }}
      />
      {isLoading ? (
        <QuestionsGridSkeleton count={3} />
      ) : (
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {popular.slice(0, 3).map((q) => (
            <motion.div
              key={q._id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="h-full"
            >
              <QuestionCard question={q} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default HomePage;
