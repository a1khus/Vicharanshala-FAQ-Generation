import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin.service';
import { categoriesApi } from '../services/categories.service';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { StatBadge, EmptyState } from '../components/common';
import toast from 'react-hot-toast';
import { Users, HelpCircle, AlertTriangle, BarChart3, Tag, Shield } from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'questions' | 'categories' | 'searches';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const tabs: { value: AdminTab; label: string; icon: React.ReactNode }[] = [
    { value: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { value: 'users', label: 'Users', icon: <Users size={16} /> },
    { value: 'questions', label: 'Questions', icon: <HelpCircle size={16} /> },
    { value: 'categories', label: 'Categories', icon: <Tag size={16} /> },
    { value: 'searches', label: 'Unanswered', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="page-container py-12">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface mb-1 flex items-center gap-3">
          <Shield size={28} className="text-primary-container" /> Admin Dashboard
        </h1>
        <p className="text-on-surface-variant">Manage users, content, and site analytics.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3 space-y-1">
            {tabs.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === value ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'questions' && <QuestionsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'searches' && <UnansweredTab />}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = () => {
  const { data } = useQuery({ queryKey: ['site-stats'], queryFn: adminApi.getStats });
  const stats = data?.data;
  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface mb-6">Site Overview</h2>
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBadge label="Users" value={stats.totalUsers.toLocaleString()} icon="group" />
          <StatBadge label="Questions" value={stats.totalQuestions.toLocaleString()} icon="help_outline" />
          <StatBadge label="Answers" value={stats.totalAnswers.toLocaleString()} icon="question_answer" />
          <StatBadge label="Votes" value={stats.totalVotes.toLocaleString()} icon="thumb_up" />
          <StatBadge label="Searches" value={stats.totalSearches.toLocaleString()} icon="search" />
        </div>
      ) : (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-32 bg-surface-container rounded-xl" />)}
        </div>
      )}
    </div>
  );
};

const UsersTab = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers() });
  const users = data?.data ?? [];

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to delete user'),
  });

  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface mb-6">User Management</h2>
      {isLoading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-surface-container rounded-xl" />)}</div> :
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/20">
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-label-md text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                  <td className="px-4 py-3 font-medium text-on-surface">{u.username}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      className="text-xs border border-outline-variant/50 rounded-lg px-2 py-1 bg-surface focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm('Delete user?')) deleteMutation.mutate(u._id); }} className="text-xs text-error hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
};

const QuestionsTab = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminApi.getQuestions() });
  const questions = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => { toast.success('Question removed'); queryClient.invalidateQueries({ queryKey: ['admin-questions'] }); },
  });

  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface mb-6">Content Moderation</h2>
      {isLoading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-surface-container rounded-xl" />)}</div> :
        questions.length === 0 ? <EmptyState icon="check_circle" title="No questions to moderate" /> :
        <div className="space-y-3">
          {questions.map((q: any) => (
            <div key={q._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface truncate">{q.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">by {q.author?.username} · {q.status} · {q.answerCount} answers</p>
              </div>
              <button onClick={() => { if (confirm('Remove this question?')) deleteMutation.mutate(q._id); }} className="text-xs text-error hover:underline flex-shrink-0">Remove</button>
            </div>
          ))}
        </div>}
    </div>
  );
};

const CategoriesTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', icon: 'category', color: '#494bd6' });
  const { data } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const categories = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create(form),
    onSuccess: () => { toast.success('Category created'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setForm({ name: '', description: '', icon: 'category', color: '#494bd6' }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
  });

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-primary-container outline-none text-sm text-on-surface';

  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface mb-6">Categories</h2>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 mb-6">
        <h3 className="font-semibold text-on-surface mb-4">Add New Category</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Category name" className={inputClass} />
          <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Material icon name" className={inputClass} />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={inputClass} />
          <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 rounded-lg w-full cursor-pointer border border-outline-variant/40" />
        </div>
        <button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending} className="btn-primary text-sm py-2 px-5">
          Create Category
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat: any) => (
          <div key={cat._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}22` }}>
              <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-on-surface text-sm">{cat.name}</p>
              <p className="text-xs text-on-surface-variant">{cat.questionCount} questions</p>
            </div>
            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(cat._id); }} className="text-xs text-error hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const UnansweredTab = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin-unanswered'], queryFn: () => adminApi.getUnansweredSearches() });
  const searches = data?.data ?? [];

  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface mb-6">Unanswered Searches</h2>
      <p className="text-body-md text-on-surface-variant mb-6">These queries returned no results and were reported by users. Use them to identify content gaps.</p>
      {isLoading ? (
        <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl" />)}</div>
      ) : searches.length === 0 ? (
        <EmptyState icon="check_circle" title="No unanswered searches" description="Great! All searches are returning results." />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low">
              <tr>
                {['Search Query', 'Reports', 'First Reported'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-label-md text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searches.map((s: any) => (
                <tr key={s._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50">
                  <td className="px-4 py-3 font-medium text-on-surface">"{s.query}"</td>
                  <td className="px-4 py-3">
                    <span className="bg-error-container text-error text-xs px-2 py-0.5 rounded-full font-semibold">{s.count}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
