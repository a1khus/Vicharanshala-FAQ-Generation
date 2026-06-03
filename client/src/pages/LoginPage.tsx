import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check, Shield, Users, MessageSquare, Sparkles } from 'lucide-react';
import { authApi } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import type { LoginForm, SignupForm } from '../types';

// ─── Validation Schemas ─────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ─── Password Strength Helper ───────────────────────────────────────────────

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: '#ba1a1a', percent: 20 };
  if (score <= 2) return { label: 'Fair', color: '#e8770e', percent: 40 };
  if (score <= 3) return { label: 'Good', color: '#f5a623', percent: 60 };
  if (score <= 4) return { label: 'Strong', color: '#4caf50', percent: 80 };
  return { label: 'Excellent', color: '#2e7d32', percent: 100 };
};

// ─── Floating Particles Background ──────────────────────────────────────────

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(255, 92, 53, ${0.1 + Math.random() * 0.15})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ─── Feature Items ──────────────────────────────────────────────────────────

const features = [
  {
    icon: MessageSquare,
    title: 'Ask & Answer',
    desc: 'Get instant answers from a vibrant community of experts',
  },
  {
    icon: Users,
    title: 'Grow Together',
    desc: 'Build your reputation by sharing knowledge',
  },
  {
    icon: Shield,
    title: 'Trusted Content',
    desc: 'Community-voted answers you can rely on',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

const LoginPage = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  // Reset forms when switching tabs
  useEffect(() => {
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      navigate('/questions');
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Login failed. Please check your credentials.'),
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome to Samagama, ${res.data.user.username}!`);
      navigate('/questions');
    },
    onError: (err: any) => {
      const validation = err?.response?.data?.errors;
      if (Array.isArray(validation)) {
        validation.forEach((e: any) => {
          const field = e.field || e.param || 'form';
          signupForm.setError(field as any, {
            type: 'server',
            message: e.message || e.msg,
          });
        });
      }
      toast.error(err?.response?.data?.message || 'Signup failed. Please try again.');
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/questions" replace />;
  }

  const isLoading = loginMutation.isPending || signupMutation.isPending;
  const watchedPassword = signupForm.watch('password') || '';
  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[1100px] rounded-3xl overflow-hidden border border-outline-variant/30 shadow-ambient-hover"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #faf8f7 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row min-h-[640px]">
          {/* ─── Left Panel: Hero / Branding ─── */}
          <div className="relative lg:w-[45%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
            {/* Gradient Background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(145deg, #ff5c35 0%, #b52701 50%, #7a1a00 100%)',
              }}
            />
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                                  radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
            <FloatingParticles />

            {/* Content */}
            <div className="relative z-10">
              {/* Brand */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2.5 mb-10"
              >
                <span className="material-symbols-outlined text-white/90 text-[28px]">hub</span>
                <span className="text-headline-md font-bold text-white tracking-tight">Samagama</span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
                    Get Started
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                  Join the Knowledge
                  <br />
                  <span className="text-white/80">Revolution</span>
                </h1>
                <p className="text-white/70 text-base leading-relaxed max-w-sm">
                  Create your account and start contributing to the world's most intelligent FAQ community.
                </p>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 space-y-4 mt-10 lg:mt-0"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
                    <f.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{f.title}</p>
                    <p className="text-xs text-white/60 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="relative z-10 mt-8 lg:mt-0 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {['#6366f1', '#ec4899', '#f59e0b', '#10b981'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: color, zIndex: 4 - i }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/70">
                <span className="font-semibold text-white/90">1,000+</span> members already joined
              </p>
            </motion.div>
          </div>

          {/* ─── Right Panel: Auth Forms ─── */}
          <div className="lg:w-[55%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1 p-1 rounded-2xl bg-surface-container-low border border-outline-variant/30 mb-8"
            >
              {(['login', 'signup'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  className={`relative flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                    tab === option
                      ? 'text-white'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab === option && (
                    <motion.div
                      layoutId="auth-tab-bg"
                      className="absolute inset-0 rounded-xl bg-primary-container"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {option === 'login' ? 'Log In' : 'Create Account'}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Form Area */}
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                  className="space-y-5"
                >
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-on-surface mb-1">Welcome back</h2>
                    <p className="text-sm text-on-surface-variant">
                      Log in to your account to continue your journey
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                        mail
                      </span>
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                        lock
                      </span>
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging in…
                      </>
                    ) : (
                      <>
                        Log In
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  {/* Switch to Signup */}
                  <p className="text-center text-sm text-on-surface-variant pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="text-primary-container font-semibold hover:underline"
                    >
                      Create one for free
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  onSubmit={signupForm.handleSubmit((data) => signupMutation.mutate(data))}
                  className="space-y-5"
                >
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-on-surface mb-1">Create your account</h2>
                    <p className="text-sm text-on-surface-variant">
                      Join thousands of curious minds sharing knowledge
                    </p>
                  </div>

                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                        person
                      </span>
                      <input
                        {...signupForm.register('username')}
                        placeholder="Choose a unique username"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm"
                      />
                    </div>
                    {signupForm.formState.errors.username && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {signupForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                        mail
                      </span>
                      <input
                        {...signupForm.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {signupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field with Strength Meter */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                        lock
                      </span>
                      <input
                        {...signupForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white outline-none transition-all duration-200 text-on-surface placeholder:text-secondary text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}

                    {/* Password Strength Bar */}
                    {watchedPassword.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2.5"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-on-surface-variant">Password strength</span>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: passwordStrength.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.percent}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {[
                            { label: '6+ chars', met: watchedPassword.length >= 6 },
                            { label: 'Uppercase', met: /[A-Z]/.test(watchedPassword) },
                            { label: 'Number', met: /[0-9]/.test(watchedPassword) },
                            { label: 'Special', met: /[^A-Za-z0-9]/.test(watchedPassword) },
                          ].map((rule) => (
                            <span
                              key={rule.label}
                              className={`text-[11px] flex items-center gap-1 transition-colors ${
                                rule.met ? 'text-primary-container font-medium' : 'text-secondary'
                              }`}
                            >
                              <Check
                                size={12}
                                className={rule.met ? 'opacity-100' : 'opacity-30'}
                              />
                              {rule.label}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  {/* Terms Notice */}
                  <p className="text-center text-[11px] text-secondary leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <Link to="/privacy" className="text-primary-container hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-container hover:underline">
                      Privacy Policy
                    </Link>
                  </p>

                  {/* Switch to Login */}
                  <p className="text-center text-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-primary-container font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
