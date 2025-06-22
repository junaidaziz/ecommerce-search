import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import SearchIcon from './icons/SearchIcon';
import type { TrendingResponse, SuggestionsResponse } from '../types/api';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
  showRecent?: boolean;
  showTrending?: boolean;
  className?: string;
}

const RECENT_KEY = 'recent-searches';

const SearchBar: FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  showRecent = true,
  showTrending = true,
  className = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
      fetch('/api/trending')
        .then((res) =>
          res.ok ? (res.json() as Promise<TrendingResponse>) : null
        )
        .then((data) => {
          if (data && Array.isArray(data.keywords)) setTrending(data.keywords);
        })
        .catch(() => {});
    }
  }, [showTrending]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(query)}`)
        .then((res) =>
          res.ok ? (res.json() as Promise<SuggestionsResponse>) : null
        )
        .then((data) => {
          if (data && Array.isArray(data.suggestions))
            setSuggestions(data.suggestions);
          else setSuggestions([]);
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
        <span className="font-semibold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
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
      className={`relative flex-1 max-w-lg ${className}`}
    >
      <input
        className="input input-bordered w-full pr-16"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        placeholder={placeholder}
      />
      {query && (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setQuery('');
            setSuggestions([]);
          }}
        >
          ×
        </button>
      )}
      <SearchIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-1 bg-base-100 border border-base-200 shadow rounded z-50">
          {query && suggestions.length > 0 && (
            <ul>
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="block w-full text-left px-3 py-1 hover:bg-base-200"
                    onMouseDown={(e) => e.preventDefault()}
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
                <div className="px-2 py-1 border-b border-base-200 last:border-none">
                  <div className="px-3 py-1 text-sm font-semibold">Recent</div>
                  <ul>
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          className="block w-full text-left px-3 py-1 hover:bg-base-200"
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
              {showTrending && trending.length > 0 && (
                <div className="px-2 py-1">
                  <div className="px-3 py-1 text-sm font-semibold">
                    Trending
                  </div>
                  <ul>
                    {trending.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          className="block w-full text-left px-3 py-1 hover:bg-base-200"
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
