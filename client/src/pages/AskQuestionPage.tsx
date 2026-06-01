import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { questionsApi } from '../services/questions.service';
import { categoriesApi } from '../services/categories.service';
import type { QuestionForm } from '../types';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(300),
  categoryId: z.string().min(1, 'Please select a category'),
});

const inputClass = 'w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface text-sm';

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });
  const categories = catData?.data ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<Pick<QuestionForm, 'title' | 'categoryId'>>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: QuestionForm) => questionsApi.create(data),
    onSuccess: (res) => {
      toast.success('Question posted!');
      navigate(`/questions/${res.data._id}`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to post question'),
  });

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const onSubmit = (data: Pick<QuestionForm, 'title' | 'categoryId'>) => {
    if (description.trim().length < 20) { toast.error('Description must be at least 20 characters'); return; }
    mutate({ ...data, description, tags });
  };

  return (
    <div className="page-container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface mb-2">Ask a Question</h1>
        <p className="text-body-md text-on-surface-variant">
          Share your question with the community and get expert answers.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
          <label className="block text-sm font-bold text-on-surface mb-2">
            Question Title <span className="text-error">*</span>
          </label>
          <p className="text-xs text-on-surface-variant mb-3">Be specific and imagine you're asking a question to another person.</p>
          <input
            {...register('title')}
            placeholder="e.g. How do I integrate Tailwind CSS with Next.js App Router?"
            className={inputClass}
          />
          {errors.title && <p className="text-xs text-error mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
          <label className="block text-sm font-bold text-on-surface mb-2">
            Description <span className="text-error">*</span>
          </label>
          <p className="text-xs text-on-surface-variant mb-3">Include all the information someone would need to answer your question. Markdown is supported.</p>
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(v) => setDescription(v ?? '')}
              height={300}
              style={{ borderRadius: '12px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
          <label className="block text-sm font-bold text-on-surface mb-2">
            Category <span className="text-error">*</span>
          </label>
          <select
            {...register('categoryId')}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-error mt-1">{errors.categoryId.message}</p>}
        </div>

        {/* Tags */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
          <label className="block text-sm font-bold text-on-surface mb-2">Tags (up to 5)</label>
          <p className="text-xs text-on-surface-variant mb-3">Add tags to help others find your question. Press Enter or comma to add.</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip active flex items-center gap-1">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {tags.length < 5 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Type a tag and press Enter..."
              className={inputClass}
            />
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn-primary text-sm flex items-center gap-2">
            {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Post Question
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
