import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, TrendingUp, Clock, X, HelpCircle, Mic, MicOff, AlertCircle, Loader2, DownloadCloud } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSearchStore } from '../../store/uiStore';
import { searchApi } from '../../services/search.service';
import { questionsApi } from '../../services/questions.service';

interface SearchBarProps {
  autoFocus?: boolean;
  size?: 'default' | 'lg';
}

// ─── Utility: Debounce Hook ──────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ─── Utility: Highlight Text ─────────────────────────────────────────────────
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stopWords = new Set(['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'of']);

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const normalized = query.trim();
  if (!normalized) return <>{text}</>;

  // Extract pure words, stripping punctuation, to highlight exactly what the user typed
  const words = normalized.toLowerCase().match(/\b\w+\b/g) || [];
  if (!words.length) return <>{text}</>;

  const tokens = Array.from(new Set(words.map(escapeRegex)));
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: text.slice(match.index, match.index + match[0].length), highlight: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className="bg-primary-container/20 text-primary font-semibold rounded-sm px-0.5">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────
const SearchBar = ({ autoFocus = false, size = 'lg' }: SearchBarProps) => {
  const [focused, setFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 250);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  // Voice Search State
  type VoiceStatus = 'idle' | 'listening' | 'processing' | 'completed' | 'error';
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceErrorText, setVoiceErrorText] = useState('');
  
  // Whisper Worker State
  const workerRef = useRef<Worker | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const { data: trendingData } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: searchApi.getTrending,
    staleTime: 5 * 60 * 1000,
  });

  const { data: liveSearchData, isFetching: isLiveSearchFetching } = useQuery({
    queryKey: ['live-search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery, 1),
    enabled: debouncedQuery.trim().length > 0 && voiceStatus === 'idle',
    staleTime: 1 * 60 * 1000,
  });

  const trending = trendingData?.data ?? [];
  const liveResults = liveSearchData?.data ?? [];
  const totalLiveResults = liveSearchData?.meta?.total ?? liveResults.length;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Initialize Worker on mount
  useEffect(() => {
    if (window.Worker) {
      workerRef.current = new Worker(new URL('../../workers/whisper.worker.ts', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (event) => {
        const { status, progress, output, error } = event.data;
        if (status === 'progress') {
          setWorkerStatus('loading');
          if (progress?.progress !== undefined) {
             setDownloadProgress(Math.round(progress.progress));
          }
        } else if (status === 'ready') {
          setWorkerStatus('ready');
        } else if (status === 'complete') {
          setLocalQuery(output);
          setVoiceStatus('completed');
          setTimeout(() => {
             const finalQuery = output.trim();
             if (finalQuery) {
               addRecentSearch(finalQuery);
               navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
             }
             setVoiceStatus('idle');
             setFocused(false);
          }, 1500);
        } else if (status === 'error') {
          setWorkerStatus('error');
          setVoiceStatus('error');
          setVoiceErrorText(error || 'Unknown error occurred.');
          toast.error(error || 'Voice engine error');
        }
      };

      workerRef.current.postMessage({ type: 'load' });
    }

    return () => {
      workerRef.current?.terminate();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate, addRecentSearch]);

  const toggleVoiceSearch = async () => {
    if (workerStatus === 'loading') {
       toast.error('Voice engine is still downloading... Please wait.');
       return;
    }
    if (workerStatus === 'error') {
       toast.error('Voice engine failed to load.');
       return;
    }
    if (workerStatus !== 'ready') {
       toast.error('Voice engine not ready.');
       return;
    }

    if (voiceStatus === 'listening') {
      handleStopVoiceSearch();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setVoiceStatus('processing');
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        try {
          const audioContext = new window.AudioContext({ sampleRate: 16000 });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const float32Array = audioBuffer.getChannelData(0); // mono
          
          workerRef.current?.postMessage({
            type: 'transcribe',
            audio: float32Array
          });
        } catch (err: any) {
          console.error('Audio decode error:', err);
          setVoiceStatus('error');
          setVoiceErrorText('Failed to process audio.');
        }

        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      setVoiceErrorText('');
      setLocalQuery('');
      mediaRecorder.start();
      setVoiceStatus('listening');
      setFocused(true);
    } catch (err: any) {
      console.error(err);
      setVoiceStatus('error');
      setVoiceErrorText('Microphone access denied or unavailable.');
    }
  };

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

  const clearSearch = () => {
    setLocalQuery('');
    inputRef.current?.focus();
    if (voiceStatus === 'listening') {
      handleStopVoiceSearch();
    }
  };

  const showDropdown = focused && (localQuery.trim().length > 0 || recentSearches.length > 0 || trending.length > 0) && voiceStatus === 'idle';
  const showReset = localQuery.length > 0;
  
  // Calculate right padding based on size and active buttons
  const getRightSpacing = () => {
    if (size === 'lg') {
      if (showReset) return 'pr-28';
      return 'pr-20';
    }
    if (showReset) return 'pr-24';
    return 'pr-16';
  };

  const handleStopVoiceSearch = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

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
          className={`search-input ${getRightSpacing()}`}
          aria-label="Search questions"
          readOnly={voiceStatus === 'listening' || voiceStatus === 'processing'}
        />
        
        <div className="absolute right-2 flex items-center gap-1.5">
          {/* Reset Button */}
          <AnimatePresence>
            {showReset && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="p-2 text-secondary hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-full transition-all"
                aria-label="Clear search"
                title="Clear"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            disabled={workerStatus === 'loading' || workerStatus === 'error'}
            className={`p-2.5 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center relative ${
              voiceStatus === 'listening' 
                ? 'bg-error text-white animate-pulse' 
                : workerStatus === 'loading'
                ? 'bg-surface-container cursor-not-allowed opacity-70'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
            aria-label="Voice Search"
            title={workerStatus === 'loading' ? `Downloading Voice Model (${downloadProgress}%)` : 'Search by voice'}
          >
            {workerStatus === 'loading' ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : voiceStatus === 'listening' ? (
              <MicOff size={18} />
            ) : (
              <Mic size={18} />
            )}
            
            {workerStatus === 'loading' && (
              <div 
                className="absolute inset-0 rounded-full border-2 border-primary/20" 
                style={{ clipPath: `inset(${100 - downloadProgress}% 0 0 0)` }}
              />
            )}
            
            {voiceStatus === 'listening' && (
              <span className="absolute inset-0 rounded-full border-2 border-error animate-ping opacity-75" />
            )}
          </button>

          {/* Search Button (Hidden when listening) */}
          {voiceStatus !== 'listening' && (
            <button
              onClick={() => handleSearch()}
              className="bg-on-surface hover:bg-primary-container text-white p-2.5 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center group/btn"
              aria-label="Search"
              title="Search"
            >
              <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {voiceStatus !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                handleStopVoiceSearch();
                setVoiceStatus('idle');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center border border-outline-variant/20 overflow-hidden"
            >
              {voiceStatus === 'listening' && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-3xl pointer-events-none" />
              )}
              
              <button
                onClick={() => {
                  handleStopVoiceSearch();
                  setVoiceStatus('idle');
                }}
                className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {voiceStatus === 'listening' && (
                <>
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <Mic size={40} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2">Listening...</h3>
                  <p className="text-base text-on-surface-variant max-w-xs mb-8 min-h-[48px] flex items-center justify-center">
                    Speak clearly into your microphone...
                  </p>
                  <button
                    onClick={handleStopVoiceSearch}
                    className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Done
                  </button>
                </>
              )}
              
              {voiceStatus === 'processing' && (
                <>
                  <div className="w-24 h-24 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                    <Loader2 size={40} className="text-primary-container animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2">Processing AI</h3>
                  <p className="text-base text-on-surface-variant">Converting speech to text...</p>
                </>
              )}
              
              {voiceStatus === 'completed' && (
                <>
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2">Found it!</h3>
                  <p className="text-base font-semibold text-on-surface-variant mt-2">"{localQuery}"</p>
                </>
              )}
              
              {voiceStatus === 'error' && (
                <>
                  <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-error" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2">Oops!</h3>
                  <p className="text-base text-on-surface-variant mb-6">{voiceErrorText}</p>
                  <button 
                    onClick={() => setVoiceStatus('idle')}
                    className="px-8 py-3 bg-surface-container-high text-on-surface rounded-full font-semibold hover:bg-surface-container-highest transition-colors"
                  >
                    Try again
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 mt-2 bg-surface-container-lowest rounded-xl shadow-ambient-hover border border-outline-variant/30 overflow-hidden z-50 ${size === 'lg' ? 'w-full max-w-2xl' : 'w-full'}`}
          >
            {localQuery.trim().length > 0 ? (
              /* Live Search Results */
              <div className="py-2">
                {isLiveSearchFetching && debouncedQuery === localQuery ? (
                  <div className="px-4 py-4 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Searching FAQs...
                  </div>
                ) : liveResults.length > 0 ? (
                  <>
                    <div className="px-4 pt-2 pb-2 flex justify-between items-center bg-surface-container-lowest">
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Suggested Results ({totalLiveResults})
                      </span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {liveResults.slice(0, 5).map((q) => (
                        <button
                          key={q._id}
                          onClick={() => {
                            setFocused(false);
                            questionsApi.recordSearchClick(q._id).catch(() => {});
                            navigate(`/questions/${q._id}`);
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/10 last:border-0"
                        >
                          <HelpCircle size={16} className="text-primary-container mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-on-surface line-clamp-2 leading-snug mb-1">
                              <HighlightedText text={q.title} query={localQuery} />
                            </p>
                            <p className="text-xs text-on-surface-variant line-clamp-1">
                              <HighlightedText text={q.description || ''} query={localQuery} />
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {totalLiveResults > 5 && (
                      <button
                        onClick={() => handleSearch()}
                        className="w-full text-center py-3 bg-surface-container-lowest hover:bg-surface-container-low text-sm font-semibold text-primary transition-colors border-t border-outline-variant/20"
                      >
                        View all {totalLiveResults} results
                      </button>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                      <Search size={20} className="text-on-surface-variant" />
                    </div>
                    <p className="text-sm font-semibold text-on-surface mb-1">No matches found</p>
                    <p className="text-xs text-on-surface-variant max-w-[250px]">
                      We couldn't find any FAQs matching "{localQuery}". Try adjusting your search terms or hit enter to search all topics.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Recent and Trending Searches */
              <div className="py-2">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Recent</span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs font-medium text-primary-container hover:text-primary transition-colors"
                      >
                        Clear History
                      </button>
                    </div>
                    {recentSearches.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        onClick={() => { setLocalQuery(q); handleSearch(q); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left group/recent"
                      >
                        <Clock size={16} className="text-on-surface-variant flex-shrink-0" />
                        <span className="flex-1 truncate">{q}</span>
                        <ArrowRight size={14} className="text-on-surface-variant opacity-0 group-hover/recent:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {trending.length > 0 && (
                  <div className={recentSearches.length > 0 ? 'border-t border-outline-variant/20 mt-2 pt-2' : ''}>
                    <div className="px-4 pt-3 pb-2">
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trending Topics</span>
                    </div>
                    {trending.slice(0, 5).map((item) => (
                      <button
                        key={item.query}
                        onClick={() => { setLocalQuery(item.query); handleSearch(item.query); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left group/trend"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <TrendingUp size={16} className="text-primary flex-shrink-0" />
                          <span className="text-sm text-on-surface truncate font-medium group-hover/trend:text-primary transition-colors">{item.query}</span>
                        </div>
                        <span className="text-[11px] font-semibold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full ml-3 flex-shrink-0">
                          {item.count} searches
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
