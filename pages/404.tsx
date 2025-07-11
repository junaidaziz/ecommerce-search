import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Custom404() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-xl w-full flex flex-col items-center">
        <div className="text-[6rem] font-extrabold text-gray-800 dark:text-white leading-none mb-2">404</div>
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1">Page Not Found !</div>
        <div className="text-base text-gray-500 dark:text-gray-400 mb-6">looks like, page doesn&apos;t exist</div>
        <Link href="/dashboard" legacyBehavior>
          <a className="mb-8 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition">Back to dashboard</a>
        </Link>
        <form onSubmit={handleSearch} className="w-full flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg px-3 py-2 shadow-inner mb-8">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search"
          />
          <button type="submit" className="ml-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Search</button>
        </form>
        {/* Illustration */}
        <div className="w-full flex justify-center">
          <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="110" rx="100" ry="10" fill="#E5E7EB" />
            <circle cx="60" cy="80" r="18" fill="#FBBF24" />
            <rect x="100" y="60" width="60" height="30" rx="10" fill="#60A5FA" />
            <circle cx="130" cy="75" r="8" fill="#2563EB" />
            <rect x="150" y="80" width="8" height="18" rx="4" fill="#34D399" />
            <rect x="170" y="70" width="8" height="28" rx="4" fill="#A7F3D0" />
            <circle cx="180" cy="100" r="6" fill="#F87171" />
            <text x="110" y="50" textAnchor="middle" fontSize="32" fill="#6366F1">?</text>
          </svg>
        </div>
      </div>
    </div>
  );
} 