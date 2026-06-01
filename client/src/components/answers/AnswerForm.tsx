import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { answersApi } from '../../services/answers.service';
import { Send } from 'lucide-react';

const AnswerForm = ({ questionId }: { questionId: string }) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => answersApi.create({ questionId, content }),
    onSuccess: () => {
      toast.success('Answer posted!');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['answers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to post answer'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 20) {
      toast.error('Answer must be at least 20 characters');
      return;
    }
    mutate();
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6"
      style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 className="text-headline-md font-bold text-on-surface mb-6">Your Answer</h3>

      <form onSubmit={handleSubmit}>
        <div data-color-mode="light" className="mb-4">
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? '')}
            preview="edit"
            height={280}
            style={{
              borderRadius: '12px',
              border: '2px solid transparent',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          />
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          Use Markdown for formatting. Preview your answer before submitting.
        </p>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || content.trim().length < 20}
            className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
            Post Answer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;
