import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { questionsApi } from '../services/questions.service';
import { categoriesApi } from '../services/categories.service';
import type { QuestionForm } from '../types';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(300),
  categoryId: z.string().min(1, 'Please select a category'),
});

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const insertMarkdown = (syntax: 'bold' | 'italic' | 'link' | 'quote' | 'code' | 'image' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](https://example.com)`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'quoted text'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          replacement = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
        } else {
          replacement = `\`${selectedText || 'code'}\``;
        }
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'image':
        replacement = `![${selectedText || 'image alt'}](https://example.com/image.png)`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}`;
        cursorOffset = replacement.length;
        break;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const onSubmit = (data: Pick<QuestionForm, 'title' | 'categoryId'>) => {
    if (description.trim().length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }
    mutate({ ...data, description, tags });
  };

  return (
    <div className="page-container pt-12 pb-section-gap">
      {/* Header Section */}
      <div className="mb-12 max-w-3xl">
        <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">
          Ask a Question
        </h1>
        <p className="text-body-lg text-on-secondary-container">
          Share your question with the community and get expert answers. Our community-driven wisdom helps thousands every day.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Question Form Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_40px_40px_-15px_rgba(0,0,0,0.15)]">
            
            {/* Question Title */}
            <div className="mb-8">
              <label className="block text-label-md text-on-surface mb-2" htmlFor="title">
                Question Title
              </label>
              <p className="text-sm text-on-secondary-container mb-3 italic">
                Be specific and imagine you’re asking a question to another person.
              </p>
              <input
                {...register('title')}
                className={`w-full bg-surface-container-low border-2 rounded-xl px-4 py-4 text-body-md placeholder:text-on-surface-variant/50 transition-all focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 focus:bg-white ${
                  errors.title ? 'border-error' : 'border-transparent'
                }`}
                id="title"
                placeholder="e.g. How do I integrate Tailwind CSS with Next.js App Router?"
                type="text"
              />
              {errors.title && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Editor Section */}
            <div className="mb-8">
              <label className="block text-label-md text-on-surface mb-2">
                Description Editor
              </label>
              <div className="border-2 border-surface-container-high rounded-xl overflow-hidden focus-within:border-primary-container focus-within:ring-4 focus-within:ring-primary-container/10 transition-all">
                {/* Toolbar */}
                <div className="bg-surface-container-low px-4 py-2 flex flex-wrap gap-2 border-b border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('bold')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Bold"
                  >
                    <span className="material-symbols-outlined text-xl">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('italic')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Italic"
                  >
                    <span className="material-symbols-outlined text-xl">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('link')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Link"
                  >
                    <span className="material-symbols-outlined text-xl">link</span>
                  </button>
                  <div className="w-px h-6 bg-surface-container-highest self-center"></div>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('quote')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Quote"
                  >
                    <span className="material-symbols-outlined text-xl">format_quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('code')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Code"
                  >
                    <span className="material-symbols-outlined text-xl">code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('image')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="Image"
                  >
                    <span className="material-symbols-outlined text-xl">image</span>
                  </button>
                  <div className="w-px h-6 bg-surface-container-highest self-center"></div>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('list')}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant flex items-center justify-center"
                    title="List"
                  >
                    <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                  </button>
                </div>
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-0 p-4 text-body-md placeholder:text-on-surface-variant/50 focus:ring-0 outline-none"
                  placeholder="Explain the problem you're facing and what you've tried..."
                  rows={12}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <span className="text-xs text-on-surface-variant font-medium">Markdown Supported</span>
              </div>
            </div>

            {/* Category & Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Category */}
              <div>
                <label className="block text-label-md text-on-surface mb-2" htmlFor="category">
                  Category Selection
                </label>
                <div className="relative">
                  <select
                    {...register('categoryId')}
                    className={`w-full appearance-none bg-surface-container-low border-2 rounded-xl px-4 py-4 text-body-md cursor-pointer focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 focus:bg-white pr-12 ${
                      errors.categoryId ? 'border-error' : 'border-transparent'
                    }`}
                    id="category"
                    defaultValue=""
                  >
                    <option disabled value="">
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
                {errors.categoryId && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-label-md text-on-surface mb-2" htmlFor="tags">
                  Tags Input
                </label>
                <div className="relative">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-4 text-body-md pr-12 focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 focus:bg-white border-2 border-transparent"
                    id="tags"
                    placeholder={tags.length >= 5 ? "Max tags reached" : "Add up to 5 tags (e.g. react, css)"}
                    type="text"
                    disabled={tags.length >= 5}
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                    sell
                  </span>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/30 rounded-full text-xs font-semibold"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="hover:text-error transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-surface-container-high">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none bg-primary-container text-on-primary-container px-10 py-4 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
              >
                {isPending && (
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                )}
                Post Question
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none bg-surface-container-high text-on-surface px-10 py-4 rounded-full font-semibold text-sm tracking-wide hover:bg-surface-container-highest active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>

        {/* Sidebar Column / Tips */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_40px_40px_-15px_rgba(0,0,0,0.15)] border border-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
            </div>
            <h3 className="text-headline-md font-bold mb-4 text-on-surface">Tips for a Great Question</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary text-xl animate-pulse-slow">check_circle</span>
                <p className="text-body-md text-on-secondary-container">Keep your title concise and descriptive.</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary text-xl animate-pulse-slow">check_circle</span>
                <p className="text-body-md text-on-secondary-container">Include code snippets if applicable.</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary text-xl animate-pulse-slow">check_circle</span>
                <p className="text-body-md text-on-secondary-container">Explain what you've already tried to solve it.</p>
              </li>
            </ul>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl">
            <img
              alt="Help Section"
              className="w-full h-full object-cover grayscale opacity-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP-hbGOm4RPTZFIudaiuR1J1wAMjYeZOOsEBgPbE1QDQBVfCEbUWvWBYi64ubLvG-fGtFgJJydppQP240xtuhguiXJEZbAnFcTfuxiAyBtZXiHIDCJ2yL2q5JI7vQKJ3MJQ5VED65uhjmNfaH2fQWVYHFEfwDKOTi4xNfg32Q5j7T2qJ0U_G7Z7RZY3ze99jS-vPw9yS-dAnI__CZRv16mLalCWxeNBlGxGWS88qchNXbRutOJNNc5sO6yqex5aMbrr4e0Q_SCgdo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
              <div>
                <p className="text-white font-bold text-lg mb-1">Need help immediately?</p>
                <a
                  className="text-primary-fixed-dim font-semibold hover:underline flex items-center gap-1"
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join our Discord <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
