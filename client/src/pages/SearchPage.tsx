import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/search/SearchBar';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, EmptyState } from '../components/common';
import { searchApi } from '../services/search.service';
import { questionsApi } from '../services/questions.service';
import toast from 'react-hot-toast';
import { AlertCircle, Send } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [reported, setReported] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: !!query,
  });

  const reportMutation = useMutation({
    mutationFn: () => searchApi.reportUnanswered(query),
    onSuccess: () => {
      toast.success('Search reported — our team will look into it!');
      setReported(true);
    },
    onError: () => toast.error('Failed to report search'),
  });

  // Record search click when user selects a result
  const handleResultClick = (questionId: string) => {
    questionsApi.recordSearchClick(questionId).catch(() => {});
  };

  const results = data?.data ?? [];
  const hasResults = results.length > 0;

  return (
    <div className="page-container py-12">
      {/* Search */}
      <div className="max-w-2xl mb-10">
        <SearchBar autoFocus={!query} />
      </div>

      {query && (
        <div className="mb-6">
          <h1 className="text-headline-md font-bold text-on-surface">
            {isLoading || isFetching
              ? 'Searching...'
              : hasResults
              ? `${results.length} results for "${query}"`
              : `No results for "${query}"`}
          </h1>
        </div>
      )}

      {!query ? (
        <EmptyState icon="search" title="Search for anything" description="Type a question to find answers from the community." />
      ) : isLoading || isFetching ? (
        <QuestionsGridSkeleton count={6} />
      ) : hasResults ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {results.map((q) => (
            <div key={q._id} onClick={() => handleResultClick(q._id)}>
              <QuestionCard question={q} />
            </div>
          ))}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg"
          >
            <EmptyState
              icon="search_off"
              title="Couldn't find what you're looking for?"
              description={`No results found for "${query}". Your search may be a new topic! Help us grow by reporting it.`}
            />

            {/* Report unanswered */}
            <div className="mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="text-primary-container flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Report Missing Question</h3>
                  <p className="text-sm text-on-surface-variant">
                    Let us know that "<strong>{query}</strong>" is unanswered. We'll add it to our knowledge base.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => reportMutation.mutate()}
                  disabled={reported || reportMutation.isPending}
                  className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  {reported ? 'Reported!' : 'Report Search'}
                </button>
                <button
                  onClick={() => navigate('/questions/ask')}
                  className="btn-secondary text-sm py-2.5 px-5"
                >
                  Ask This Question
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default SearchPage;
