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

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stopWords = new Set(['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'of']);

const getHighlightedTextParts = (text: string, query: string) => {
  const normalized = query.trim();
  if (!normalized) return undefined;

  // Extract pure words, stripping punctuation, to highlight exactly what the user typed
  const words = normalized.toLowerCase().match(/\b\w+\b/g) || [];
  if (!words.length) return undefined;

  const tokens = Array.from(new Set(words.map(escapeRegex)));
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }

    parts.push({ text: text.slice(match.index, match.index + match[0].length), highlight: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  return parts.length > 0 ? parts : undefined;
};

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
    questionsApi.recordSearchClick(questionId).catch(() => { });
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
            <div key={q._id} onClick={() => handleResultClick(q._id)} className="h-full">
              <QuestionCard
                question={q}
                highlightedTitleParts={getHighlightedTextParts(q.title, query)}
              />
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
