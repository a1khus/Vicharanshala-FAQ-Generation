import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  query: string;
  recentSearches: string[];
  setQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      recentSearches: [],

      setQuery: (query) => set({ query }),

      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim().toLowerCase();
          if (!trimmed) return state;
          const filtered = state.recentSearches.filter((q) => q !== trimmed);
          return { recentSearches: [trimmed, ...filtered].slice(0, 8) };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'samagama-search',
      partialize: (s) => ({ recentSearches: s.recentSearches }),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UiState {
  sidebarOpen: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  setSidebarOpen: (open: boolean) => void;
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  authModalOpen: false,
  authModalTab: 'login',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
