import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { authApi } from '../../services/auth.service';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Explore' },
    { to: '/categories', label: 'Categories' },
    { to: '/community', label: 'Community' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group"
          >
            <span className="material-symbols-outlined text-primary-container text-[28px] group-hover:scale-110 transition-transform">
              hub
            </span>
            <span className="text-headline-md font-bold text-primary tracking-tight">
              WiseFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-label-md font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary-fixed'
                      : 'text-on-secondary-fixed-variant hover:text-primary hover:bg-surface-container-low'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all"
            >
              <Search size={18} />
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-container-low transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <span className="hidden md:block text-label-md font-semibold text-on-surface">
                    {user.username}
                  </span>
                  <ChevronDown size={14} className="text-on-surface-variant" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-outline-variant/20">
                        <p className="font-semibold text-on-surface">{user.username}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <User size={16} /> Profile
                        </Link>
                        {['admin', 'moderator'].includes(user.role) && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          >
                            <Settings size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="btn-primary text-sm py-2.5 px-6"
              >
                Get Started
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-xl"
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-label-md font-semibold ${
                      isActive ? 'text-primary bg-primary-fixed' : 'text-on-surface hover:bg-surface-container-low'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link
                to="/search"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-label-md font-semibold text-on-surface hover:bg-surface-container-low flex items-center gap-2"
              >
                <Search size={16} /> Search
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
