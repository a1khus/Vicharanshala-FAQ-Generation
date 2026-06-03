import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ThumbsUp, MessageCircle, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Question } from '../../types';

interface HighlightPart {
  text: string;
  highlight: boolean;
}

interface QuestionCardProps {
  question: Question;
  variant?: 'default' | 'compact' | 'featured';
  showSearchBadge?: boolean;
  highlightedTitleParts?: HighlightPart[];
}

const getCategoryColor = (color?: string) => {
  const defaults: Record<string, string> = {
    '#494bd6': 'bg-tertiary-fixed text-on-tertiary-fixed',
    '#b52701': 'bg-primary-fixed text-on-primary-fixed',
    '#ff5c35': 'bg-primary-fixed text-on-primary-fixed',
  };
  return defaults[color ?? ''] ?? 'bg-surface-container text-on-surface-variant';
};

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const QuestionCard = ({
  question,
  variant = 'default',
  showSearchBadge = false,
  highlightedTitleParts,
}: QuestionCardProps) => {
  const isCompact = variant === 'compact';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        to={`/questions/${question._id}`}
        className="block h-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 transition-all duration-300 cursor-pointer group"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.12)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 10px 15px -3px rgba(0,0,0,0.1), 0 20px 40px -10px rgba(0,0,0,0.18)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.12)';
        }}
      >
        <div className={`flex flex-col h-full ${isCompact ? 'p-4' : 'p-8'}`}>
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className={`category-badge ${getCategoryColor(question.category?.color)}`}
            >
              {question.category?.name ?? 'General'}
            </span>
            {question.answerCount > 0 && (
              <span className="category-badge bg-green-50 text-green-700">
                ✓ Answered
              </span>
            )}
            {showSearchBadge && question.searchCount != null && question.searchCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                <Search size={10} />
                {formatCount(question.searchCount)} searches
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-on-surface mb-4 flex-grow group-hover:text-primary transition-colors duration-200 ${
              isCompact ? 'text-body-md' : 'text-body-lg'
            }`}
          >
            {highlightedTitleParts ? (
              highlightedTitleParts.map((part, index) => (
                <span
                  key={index}
                  className={part.highlight ? 'bg-yellow-100 text-on-surface font-semibold' : undefined}
                >
                  {part.text}
                </span>
              ))
            ) : (
              question.title
            )}
          </h3>

          {/* Tags */}
          {!isCompact && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag-chip text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer stats */}
          <div className="flex items-center justify-between text-secondary mt-auto pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Eye size={16} className="text-secondary" />
                {formatCount(question.viewCount)}
              </span>
              <span className="flex items-center gap-1 text-primary-container">
                <ThumbsUp size={16} />
                {formatCount(question.upvotes)}
              </span>
              <span className="flex items-center gap-1 text-tertiary">
                <MessageCircle size={16} />
                {question.answerCount}
              </span>
            </div>

            {!isCompact && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Clock size={12} />
                {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuestionCard;
