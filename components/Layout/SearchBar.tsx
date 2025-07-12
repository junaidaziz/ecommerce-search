import { getTrending, getSuggestions } from '@lib/api/search';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import SearchInput from '../common/SearchInput';
import XMarkIcon from '../icons/XMarkIcon';
import type { TrendingResponse, SuggestionsResponse } from '@/types';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
  showRecent?: boolean;
  showTrending?: boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

const RECENT_KEY = 'recent-searches';

const SearchBar: FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  showRecent = true,
  showTrending = true,
  className = '',
  inputClassName = '',
  buttonClassName = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const suggestTimeout = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (showRecent) {
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        if (Array.isArray(stored)) setRecent(stored);
      } catch {
        // ignore
      }
    }
  }, [showRecent]);

  useEffect(() => {
    if (showTrending) {
      getTrending()
        .then((keywords) => setTrending(keywords))
        .catch(() => {});
    }
  }, [showTrending]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIdx(-1);
      return;
    }
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => {
      getSuggestions(query)
        .then((sugs) => {
          setSuggestions(sugs);
          setSelectedIdx(-1);
        })
        .catch(() => setSuggestions([]));
    }, 250);
    return () => {
      if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    };
  }, [query]);

  const highlightMatch = (text: string, q: string) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-medium">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (!showSuggestions) {
        setShowSuggestions(true);
        return;
      }
      if (suggestions.length === 0) return;
      e.preventDefault();
      setSelectedIdx((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      if (!showSuggestions) return;
      if (suggestions.length === 0) return;
      e.preventDefault();
      setSelectedIdx(
        (idx) => (idx - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === 'Enter') {
      if (selectedIdx >= 0) {
        e.preventDefault();
        handleSearch(suggestions[selectedIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    if (showRecent) {
      const updated = [trimmed, ...recent.filter((r) => r !== trimmed)];
      const slice = updated.slice(0, 5);
      setRecent(slice);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(slice));
      } catch {
        // ignore
      }
    }
    setQuery(trimmed);
    setShowSuggestions(false);
    setSelectedIdx(-1);
    if (onSearch) onSearch(trimmed);
    else router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  };

  const selectSuggestion = (term: string) => {
    handleSearch(term);
  };

  return (
    <form
      onSubmit={submitSearch}
      ref={formRef}
      className={`relative flex-1 max-w-lg transition-all duration-300 focus-within:max-w-xl ${className}`}
    >
      <SearchInput
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onKeyDown={handleKeyDown}
        onSearch={handleSearch}
        placeholder={placeholder}
        inputClassName={inputClassName}
        buttonClassName={buttonClassName}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setQuery('');
            setSuggestions([]);
            setSelectedIdx(-1);
          }}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
      {showSuggestions && (
        <div
          className="absolute left-0 mt-1 w-full max-w-[500px] rounded-md shadow-md border border-zinc-700 bg-white/10 dark:bg-zinc-800 z-50 max-h-[300px] overflow-y-auto py-1"
        >
          {query && suggestions.length > 0 && (
            <ul>
              {suggestions.map((s, idx) => (
                <li key={s}>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 h-10 cursor-pointer hover:bg-zinc-700 ${
                      idx === selectedIdx ? 'bg-zinc-700' : ''
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => selectSuggestion(s)}
                  >
                    {highlightMatch(s, query)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!query && (
            <>
              {showRecent && recent.length > 0 && (
                <div className="px-1">
                  <div className="px-4 py-2 text-xs uppercase text-gray-400">Recent</div>
                  <ul>
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 h-10 cursor-pointer hover:bg-zinc-700"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(r)}
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {showRecent && recent.length > 0 && showTrending && trending.length > 0 && (
                <hr className="my-2 border-zinc-600" />
              )}
              {showTrending && trending.length > 0 && (
                <div className="px-1">
                  <div className="px-4 py-2 text-xs uppercase text-gray-400">Trending</div>
                  <ul>
                    {trending.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 h-10 cursor-pointer hover:bg-zinc-700"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(t)}
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
