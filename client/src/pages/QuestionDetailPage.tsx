import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { Eye, CheckCircle2, MessageSquarePlus, Clock } from 'lucide-react';
import { questionsApi } from '../services/questions.service';
import { answersApi } from '../services/answers.service';
import VoteButtons from '../components/votes/VoteButtons';
import AnswerForm from '../components/answers/AnswerForm';
import { AnswerSkeleton, EmptyState, ErrorState } from '../components/common';
import QuestionCard from '../components/questions/QuestionCard';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import toast from 'react-hot-toast';

const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUiStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsApi.getById(id!),
    enabled: !!id,
  });

  const { data: answersData, isLoading: answersLoading } = useQuery({
    queryKey: ['answers', id],
    queryFn: () => answersApi.getByQuestion(id!),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', id],
    queryFn: () => questionsApi.getRelated(id!),
    enabled: !!id,
  });

  // Increment view count on mount
  useEffect(() => {
    if (id) questionsApi.incrementView(id).catch(() => {});
  }, [id]);

  const acceptMutation = useMutation({
    mutationFn: (answerId: string) => answersApi.accept(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      toast.success('Answer accepted!');
    },
  });

  const deleteAnswerMutation = useMutation({
    mutationFn: (answerId: string) => answersApi.delete(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      toast.success('Answer deleted');
    },
  });

  const question = data?.data;
  const answers = answersData?.data ?? [];
  const related = relatedData?.data ?? [];

  if (isLoading) return (
    <div className="page-container py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-surface-container rounded-full w-3/4 mb-4" />
        <div className="h-4 bg-surface-container rounded w-1/2 mb-8" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 bg-surface-container rounded w-full" />)}
        </div>
      </div>
    </div>
  );

  if (isError || !question) return (
    <div className="page-container py-12">
      <ErrorState message="Question not found" retry={refetch} />
    </div>
  );

  return (
    <div className="page-container py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="text-sm text-on-surface-variant mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/questions" className="hover:text-primary transition-colors">Questions</Link>
            <span>/</span>
            <span className="text-on-surface truncate">{question.title}</span>
          </nav>

          {/* Question Card */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 mb-8"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.12)' }}
          >
            {/* Category + Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="category-badge bg-tertiary-fixed text-on-tertiary-fixed">
                {question.category?.name}
              </span>
              {question.tags.map((tag) => (
                <Link key={tag} to={`/questions?tags=${tag}`} className="tag-chip">
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-headline-md font-bold text-on-surface mb-6">{question.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant mb-6 pb-6 border-b border-outline-variant/20">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                  {question.author?.username?.[0]?.toUpperCase()}
                </div>
                <Link to={`/profile/${question.author?.username}`} className="hover:text-primary font-medium">
                  {question.author?.username}
                </Link>
              </span>
              <span className="flex items-center gap-1"><Clock size={14} />{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1"><Eye size={14} />{question.viewCount.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><MessageSquarePlus size={14} />{question.answerCount} answers</span>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-on-surface leading-relaxed mb-6">
              <ReactMarkdown>{question.description}</ReactMarkdown>
            </div>

            {/* Vote */}
            <VoteButtons
              targetId={question._id}
              targetType="question"
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              voteScore={question.voteScore}
            />
          </motion.article>

          {/* Answers Section */}
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-6">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {answersLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => <AnswerSkeleton key={i} />)}
              </div>
            ) : answers.length === 0 ? (
              <EmptyState icon="question_answer" title="No answers yet" description="Be the first to answer this question!" />
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <motion.div
                    key={answer._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-surface-container-lowest rounded-xl border p-6 ${
                      answer.isAccepted ? 'border-green-300 bg-green-50/30' : 'border-outline-variant/30'
                    }`}
                  >
                    {answer.isAccepted && (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold mb-4">
                        <CheckCircle2 size={16} /> Accepted Answer
                      </div>
                    )}

                    {/* Author */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {answer.author?.avatar ? (
                            <img src={answer.author.avatar} alt="" className="w-full h-full object-cover" />
                          ) : answer.author?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/profile/${answer.author?.username}`} className="text-sm font-semibold text-on-surface hover:text-primary">
                            {answer.author?.username}
                          </Link>
                          <p className="text-xs text-on-surface-variant">
                            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Owner actions */}
                      {user && (answer.author?._id === user._id || ['admin', 'moderator'].includes(user.role)) && (
                        <button
                          onClick={() => { if (confirm('Delete this answer?')) deleteAnswerMutation.mutate(answer._id); }}
                          className="text-xs text-error hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="prose prose-sm max-w-none text-on-surface leading-relaxed mb-4">
                      <ReactMarkdown>{answer.content}</ReactMarkdown>
                    </div>

                    <div className="flex items-center justify-between">
                      <VoteButtons
                        targetId={answer._id}
                        targetType="answer"
                        upvotes={answer.upvotes}
                        downvotes={answer.downvotes}
                        voteScore={answer.voteScore}
                      />

                      {/* Accept button for question author */}
                      {user?._id === question.author?._id && !answer.isAccepted && (
                        <button
                          onClick={() => acceptMutation.mutate(answer._id)}
                          className="text-sm text-green-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Accept
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Post Answer Form */}
            <div className="mt-10">
              {isAuthenticated ? (
                <AnswerForm questionId={question._id} />
              ) : (
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 text-center">
                  <p className="text-on-surface-variant mb-4">
                    <button onClick={() => openAuthModal('login')} className="text-primary-container font-semibold hover:underline">Log in</button>
                    {' '}or{' '}
                    <button onClick={() => openAuthModal('signup')} className="text-primary-container font-semibold hover:underline">create an account</button>
                    {' '}to post an answer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          {related.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 sticky top-24">
              <h3 className="text-label-md font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container">link</span>
                Related Questions
              </h3>
              <div className="space-y-3">
                {related.map((q) => (
                  <QuestionCard key={q._id} question={q} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
