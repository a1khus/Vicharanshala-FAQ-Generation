import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from 'axios';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionsGridSkeleton, EmptyState } from '../components/common';
import { HelpCircle, MessageSquare, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  const { data: userData } = useQuery({
    queryKey: ['user', username],
    queryFn: () => axios.get(`/api/v1/users/${username}`).then(r => r.data.data),
    enabled: !!username,
  });

  const { data: questionsData, isLoading: qLoading } = useQuery({
    queryKey: ['user-questions', username],
    queryFn: () => axios.get(`/api/v1/users/${username}/questions`).then(r => r.data.data),
    enabled: !!username && activeTab === 'questions',
  });

  const { data: answersData, isLoading: aLoading } = useQuery({
    queryKey: ['user-answers', username],
    queryFn: () => axios.get(`/api/v1/users/${username}/answers`).then(r => r.data.data),
    enabled: !!username && activeTab === 'answers',
  });

  const user = userData;
  const questions = questionsData ?? [];
  const answers = answersData ?? [];

  if (!user) return (
    <div className="page-container py-12">
      <div className="animate-pulse max-w-3xl mx-auto">
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-surface-container" />
          <div className="flex-1">
            <div className="h-6 w-40 bg-surface-container rounded mb-2" />
            <div className="h-4 w-24 bg-surface-container rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container py-12 max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-headline-md font-bold text-on-surface">{user.username}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user.role === 'admin' ? 'bg-primary-fixed text-primary' :
                user.role === 'moderator' ? 'bg-tertiary-fixed text-tertiary' :
                'bg-surface-container text-on-surface-variant'
              }`}>
                {user.role}
              </span>
            </div>

            {user.bio && <p className="text-body-md text-on-surface-variant mb-4">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500" />{user.reputation} reputation</span>
              <span className="flex items-center gap-1.5"><HelpCircle size={14} />{user.questionCount} questions</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={14} />{user.answerCount} answers</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} />Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 mb-8">
        {(['questions', 'answers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize relative transition-colors ${
              activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'questions' ? (
        qLoading ? <QuestionsGridSkeleton count={3} /> :
        questions.length === 0 ? <EmptyState icon="help_outline" title="No questions yet" /> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q: any) => <QuestionCard key={q._id} question={{ ...q, author: user }} />)}
        </div>
      ) : (
        aLoading ? <QuestionsGridSkeleton count={3} /> :
        answers.length === 0 ? <EmptyState icon="question_answer" title="No answers yet" /> :
        <div className="space-y-4">
          {answers.map((a: any) => (
            <div key={a._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
              <p className="text-sm font-semibold text-primary-container mb-2 hover:underline cursor-pointer">
                {a.questionId?.title ?? 'Question'}
              </p>
              <p className="text-body-md text-on-surface line-clamp-3">{a.content}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant">
                <span>{a.upvotes} upvotes</span>
                {a.isAccepted && <span className="text-green-600 font-semibold">✓ Accepted</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
