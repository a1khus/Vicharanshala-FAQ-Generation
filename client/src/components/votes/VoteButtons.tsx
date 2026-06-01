import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { questionsApi } from '../../services/questions.service';
import { answersApi } from '../../services/answers.service';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

interface VoteButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  upvotes: number;
  downvotes: number;
  voteScore: number;
}

const VoteButtons = ({ targetId, targetType, upvotes, downvotes, voteScore }: VoteButtonsProps) => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUiStore();
  const queryClient = useQueryClient();

  const [optimisticScore, setOptimisticScore] = useState<number | null>(null);
  const [optimisticVote, setOptimisticVote] = useState<1 | -1 | 0 | null>(null);

  const { data: voteData } = useQuery({
    queryKey: ['user-vote', targetType, targetId],
    queryFn: () =>
      targetType === 'question'
        ? questionsApi.getUserVote(targetId)
        : Promise.resolve({ data: { value: 0 } }),
    enabled: isAuthenticated,
    select: (d) => d.data?.value as 1 | -1 | 0,
  });

  const currentVote = optimisticVote ?? (voteData ?? 0);
  const displayScore = optimisticScore ?? voteScore;

  const { mutate: vote } = useMutation({
    mutationFn: (value: 1 | -1) =>
      targetType === 'question'
        ? questionsApi.vote(targetId, value)
        : answersApi.vote(targetId, value),
    onMutate: (value) => {
      const prevVote = currentVote as 1 | -1 | 0;
      let delta = 0;
      if (prevVote === value) { delta = value === 1 ? -1 : 1; setOptimisticVote(0); }
      else if (prevVote === 0) { delta = value; setOptimisticVote(value); }
      else { delta = value === 1 ? 2 : -2; setOptimisticVote(value); }
      setOptimisticScore(displayScore + delta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vote', targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: [targetType === 'question' ? 'question' : 'answers'] });
    },
    onError: () => {
      setOptimisticScore(null);
      setOptimisticVote(null);
      toast.error('Failed to register vote');
    },
  });

  const handleVote = (value: 1 | -1) => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    vote(value);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(1)}
        className={`vote-btn-up ${currentVote === 1 ? 'active' : ''}`}
        aria-label="Upvote"
      >
        <ThumbsUp size={15} />
        <AnimatePresence mode="wait">
          <motion.span
            key={upvotes}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {upvotes}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <span className="text-sm font-bold text-on-surface min-w-[24px] text-center">
        {displayScore}
      </span>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(-1)}
        className={`vote-btn-down ${currentVote === -1 ? 'active' : ''}`}
        aria-label="Downvote"
      >
        <ThumbsDown size={15} />
        {downvotes}
      </motion.button>
    </div>
  );
};

export default VoteButtons;
