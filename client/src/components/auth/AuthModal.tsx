import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/auth.service';
import type { LoginForm, SignupForm } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
});

const inputClass = 'w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm';
const errorClass = 'text-xs text-error mt-1';

const AuthModal = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useUiStore();
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      closeAuthModal();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Login failed'),
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome to Samagama, ${res.data.user.username}!`);
      closeAuthModal();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Signup failed'),
  });

  const isLoading = loginMutation.isPending || signupMutation.isPending;

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeAuthModal()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-ambient-hover border border-outline-variant/30 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-2xl">hub</span>
                <span className="font-bold text-on-surface text-lg">Samagama</span>
              </div>
              <button
                onClick={closeAuthModal}
                className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant/20">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => openAuthModal(tab)}
                  className={`flex-1 py-3 text-sm font-semibold capitalize transition-all duration-200 relative ${
                    authModalTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab === 'login' ? 'Log In' : 'Sign Up'}
                  {authModalTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {authModalTab === 'login' ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
                      <input {...loginForm.register('email')} type="email" placeholder="you@example.com" className={inputClass} />
                      {loginForm.formState.errors.email && <p className={errorClass}>{loginForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                      <input {...loginForm.register('password')} type="password" placeholder="••••••" className={inputClass} />
                      {loginForm.formState.errors.password && <p className={errorClass}>{loginForm.formState.errors.password.message}</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center flex items-center gap-2">
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Log In'}
                    </button>
                    <p className="text-center text-sm text-on-surface-variant">
                      Don't have an account?{' '}
                      <button type="button" onClick={() => openAuthModal('signup')} className="text-primary-container font-semibold hover:underline">
                        Sign up
                      </button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={signupForm.handleSubmit((d) => signupMutation.mutate(d))}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Username</label>
                      <input {...signupForm.register('username')} placeholder="wiseuser" className={inputClass} />
                      {signupForm.formState.errors.username && <p className={errorClass}>{signupForm.formState.errors.username.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
                      <input {...signupForm.register('email')} type="email" placeholder="you@example.com" className={inputClass} />
                      {signupForm.formState.errors.email && <p className={errorClass}>{signupForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                      <input {...signupForm.register('password')} type="password" placeholder="Min 6 characters" className={inputClass} />
                      {signupForm.formState.errors.password && <p className={errorClass}>{signupForm.formState.errors.password.message}</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center flex items-center gap-2">
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Create Account'}
                    </button>
                    <p className="text-center text-sm text-on-surface-variant">
                      Already have an account?{' '}
                      <button type="button" onClick={() => openAuthModal('login')} className="text-primary-container font-semibold hover:underline">
                        Log in
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
