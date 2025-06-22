import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { FC } from 'react';
import { AppContext } from '../contexts/AppContext';
import SearchIcon from './icons/SearchIcon';
import UserIcon from './icons/UserIcon';
import CartIcon from './icons/CartIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import type { User } from '../types/user';

interface HeaderProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: FC<HeaderProps> = ({ theme = 'light', setTheme }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const app = useContext(AppContext);
  const cart = app?.cart ?? [];
  const [term, setTerm] = useState('');
  const pathname = router.pathname;
  const isAuthRoute = [
    '/login',
    '/signup',
    '/user/signup',
    '/brand/signup',
  ].includes(pathname);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const itemCount = cart.reduce((sum, i) => sum + (i.qty || 0), 0);

  return (
    <header className="bg-base-300 shadow mb-6">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="shrink-0">
            <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
          </Link>
          {!isAuthRoute && (
            <form onSubmit={handleSearch} className="hidden md:block flex-1">
              <label className="relative block">
                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  className="input input-bordered pl-10 w-full"
                  placeholder="Search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </label>
            </form>
          )}
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/products">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden btn btn-ghost"
            onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          {user ? (
            <Link href="/profile" className="btn btn-ghost flex items-center gap-1">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:block">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : user.email}
              </span>
            </Link>
          ) : (
            !isAuthRoute && (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Signup
                </Link>
              </>
            )
          )}
          <Link href="/cart" className="btn btn-ghost relative">
            <CartIcon className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="badge badge-sm badge-primary absolute -top-1 -right-1">
                {itemCount}
              </span>
            )}
          </Link>
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              aria-label="Toggle dark mode"
              checked={theme === 'dark'}
              onChange={() => setTheme?.(theme === 'dark' ? 'light' : 'dark')}
            />
            <MoonIcon className="swap-on w-5 h-5" />
            <SunIcon className="swap-off w-5 h-5" />
          </label>
        </div>
      </div>
    </header>
  );
};

export default Header;
