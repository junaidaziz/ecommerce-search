import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Header() {
  const { user, cart, logout } = useContext(AppContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/search');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.productTypes || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  return (
    <header className="navbar bg-base-300 mb-6">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">Home</Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-hover mr-2">
          <label tabIndex={0} className="btn btn-outline">Categories</label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {categories.map(cat => (
              <li key={cat}>
                <Link href={`/?type=${encodeURIComponent(cat)}`}>{cat}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/cart" className="btn btn-ghost mr-2">
          Cart
          {itemCount > 0 && (
            <span className="badge badge-sm badge-primary ml-2">{itemCount}</span>
          )}
        </Link>
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link href="/admin" className="btn btn-ghost mr-2">Admin</Link>
            ) : (
              <Link href="/orders" className="btn btn-ghost mr-2">Orders</Link>
            )}
            <span className="px-2">Hello, {user.firstName || user.email}</span>
            <button onClick={logout} className="btn btn-outline ml-2">Logout</button>
          </>
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
