import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../services/admin.service';
import { StatBadge } from '../components/common';
import { Link } from 'react-router-dom';
import { Trophy, HelpCircle, MessageSquare } from 'lucide-react';

const CommunityPage = () => {
  const { data: statsData } = useQuery({ queryKey: ['site-stats'], queryFn: adminApi.getStats, staleTime: 10 * 60 * 1000 });
  const { data: topData } = useQuery({ queryKey: ['top-contributors'], queryFn: adminApi.getTopContributors, staleTime: 10 * 60 * 1000 });

  const stats = statsData?.data;
  const contributors = topData?.data ?? [];

  return (
    <div className="page-container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-headline-lg font-bold text-on-surface mb-3">Our Community</h1>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Samagama is powered by a community of knowledge-sharers. Together, we build a smarter FAQ ecosystem.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <StatBadge label="Questions" value={stats.totalQuestions.toLocaleString()} icon="help_outline" />
          <StatBadge label="Answers" value={stats.totalAnswers.toLocaleString()} icon="question_answer" />
          <StatBadge label="Members" value={stats.totalUsers.toLocaleString()} icon="group" />
          <StatBadge label="Total Votes" value={stats.totalVotes.toLocaleString()} icon="thumb_up" />
        </div>
      )}

      {/* Top Contributors */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2">
          <Trophy size={22} className="text-yellow-500" /> Top Contributors
        </h2>

        <div className="space-y-3">
          {contributors.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 flex items-center gap-4"
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-surface-container text-on-surface-variant'
              }`}>
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${user.username}`} className="font-semibold text-on-surface hover:text-primary transition-colors">
                  {user.username}
                </Link>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><HelpCircle size={11} />{user.questionCount} Q's</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} />{user.answerCount} A's</span>
                </div>
              </div>

              {/* Reputation */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-primary-container">{user.reputation.toLocaleString()}</div>
                <div className="text-xs text-on-surface-variant">rep</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
