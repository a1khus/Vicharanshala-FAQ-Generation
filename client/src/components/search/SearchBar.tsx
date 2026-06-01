import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, TrendingUp, Clock, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '../../store/uiStore';
import { searchApi } from '../../services/search.service';

interface SearchBarProps {
  autoFocus?: boolean;
  size?: 'default' | 'lg';
}

const SearchBar = ({ autoFocus = false, size = 'lg' }: SearchBarProps) => {
  const [focused, setFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  const { data: trendingData } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: searchApi.getTrending,
    staleTime: 5 * 60 * 1000,
  });

  const trending = trendingData?.data ?? [];

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSearch = (q?: string) => {
    const query = (q ?? localQuery).trim();
    if (!query) return;
    addRecentSearch(query);
    setFocused(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && (recentSearches.length > 0 || trending.length > 0);

  return (
    <div className="relative w-full group">
      <div className={`relative flex items-center ${size === 'lg' ? 'max-w-2xl w-full' : 'w-full'}`}>
        <Search
          size={18}
          className={`absolute left-5 transition-colors duration-200 ${focused ? 'text-primary-container' : 'text-secondary'}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search any question..."
          className="search-input"
          aria-label="Search questions"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 bg-on-surface hover:bg-primary-container text-white p-2.5 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center group/btn"
          aria-label="Search"
        >
          <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-ambient-hover border border-outline-variant/30 overflow-hidden z-50"
          >
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Recent</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-primary-container hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => { setLocalQuery(q); handleSearch(q); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
                  >
                    <Clock size={14} className="text-on-surface-variant flex-shrink-0" />
                    <span className="flex-1 truncate">{q}</span>
                    <X
                      size={12}
                      className="text-on-surface-variant opacity-0 group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
            )}

            {trending.length > 0 && (
              <div className={recentSearches.length > 0 ? 'border-t border-outline-variant/20' : ''}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trending</span>
                </div>
                {trending.slice(0, 5).map((item) => (
                  <button
                    key={item.query}
                    onClick={() => { setLocalQuery(item.query); handleSearch(item.query); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
                  >
                    <TrendingUp size={14} className="text-primary-container flex-shrink-0" />
                    <span className="flex-1 truncate">{item.query}</span>
                    <span className="text-xs text-on-surface-variant">{item.count}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
