import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Header() {
  const { user, cart } = useContext(AppContext);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  return (
    <header className="navbar bg-base-300 mb-6">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">Home</Link>
      </div>
      <div className="flex-none">
        <Link href="/cart" className="btn btn-ghost mr-2">
          Cart
          <span className="badge badge-sm badge-primary ml-2">{itemCount}</span>
        </Link>
        {user ? (
          <span className="px-4">Hello, {user.firstName || user.email}</span>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/signup" className="btn btn-primary ml-2">Signup</Link>
          </>
        )}
      </div>
    </header>
  );
}
