import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@lib/api';
import DEFAULT_CATEGORIES from '@lib/defaultCategories';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import ElectronicsIcon from '../icons/ElectronicsIcon';
import FashionIcon from '../icons/FashionIcon';
import HomeIcon from '../icons/HomeIcon';
import ToysIcon from '../icons/ToysIcon';
import SportsIcon from '../icons/SportsIcon';
import MenuIcon from '../icons/MenuIcon';
import type { Category } from '@/types';

interface CategoryMenuProps {
  isSuperAdmin: boolean;
  pathname: string;
  maxWidthClass?: string;
}

const iconMap: Record<string, JSX.Element> = {
  Electronics: <ElectronicsIcon className="h-5 w-5 mr-1" />,
  Fashion: <FashionIcon className="h-5 w-5 mr-1" />,
  Home: <HomeIcon className="h-5 w-5 mr-1" />,
  Toys: <ToysIcon className="h-5 w-5 mr-1" />,
  Sports: <SportsIcon className="h-5 w-5 mr-1" />,
};

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isSuperAdmin }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const hoverDelay = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const closeDropdown = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const filterCats = (cats: Category[]) =>
      cats.filter(
        (c) =>
          typeof c.name === 'string' &&
          c.name.toLowerCase() !== 'uncategorized' &&
          c.name.trim() !== '1' &&
          !/^[0-9]+$/.test(c.name)
      );

    apiFetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const catsRaw: Category[] =
          data.categories || data || DEFAULT_CATEGORIES;
        const cats = catsRaw.map((c) => ({
          ...c,
          subcategories: Array.isArray(c.subcategories)
            ? c.subcategories
                .map((s) => {
                  if (typeof s === 'string') {
                    return {
                      name: s,
                      slug: (s as string).toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9\-]/g, ''),
                    };
                  } else if (typeof s === 'object' && s && typeof s.name === 'string') {
                    return {
                      ...s,
                      slug:
                        s.slug ||
                        s.name.toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9\-]/g, ''),
                    };
                  }
                  return { name: '', slug: '' };
                })
                .filter((s) => !!s.name && !!s.slug)
            : undefined,
        }));
        setCategories(filterCats(cats as Category[]));
      })
      .catch(() => setCategories(filterCats(DEFAULT_CATEGORIES)));
  }, []);

  useEffect(() => {
    if (menuOpen && categories.length > 0) {
      setActiveCat(categories[0]);
    }
  }, [menuOpen, categories]);

  const handleMenuEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    if (hoverDelay.current) {
      clearTimeout(hoverDelay.current);
      hoverDelay.current = null;
    }
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    if (hoverDelay.current) {
      clearTimeout(hoverDelay.current);
      hoverDelay.current = null;
    }
    closeTimeout.current = setTimeout(() => setMenuOpen(false), 150);
  };

  const handleCategoryHover = (cat: Category) => {
    if (hoverDelay.current) clearTimeout(hoverDelay.current);
    hoverDelay.current = setTimeout(() => {
      setActiveCat(cat);
    }, 150);
  };

  if (isSuperAdmin) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Toggle categories"
        className="md:hidden btn btn-ghost"
        aria-controls="mobile-cat-menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((p) => !p)}
      >
        <span className="sr-only">Categories</span>
        <MenuIcon className="w-5 h-5" />
      </button>
      <ul className="menu menu-horizontal hidden md:flex" role="menubar">
        <li className="relative">
          <div onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
            <button
              type="button"
              aria-label="Categories menu"
              className="flex items-center gap-1"
              onClick={() => setMenuOpen((prev) => !prev)}
              onMouseEnter={handleMenuEnter}
            >
              Categories{' '}
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              id="mega-menu"
              role="menu"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
              className={`absolute left-0 top-full mt-1 z-50 p-4 bg-base-100 bg-opacity-100 border border-base-200 shadow-lg rounded w-screen max-w-sm sm:max-w-xl md:max-w-3xl transition-all transform ${menuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'}`}
              aria-hidden={!menuOpen}
            >
              <div className="flex gap-6">
                <div className="pr-4 border-r border-base-200 category-list min-w-[220px] max-w-xs">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/categories/${encodeURIComponent(cat.name)}`}
                      role="menuitem"
                      aria-haspopup={!!cat.subcategories?.length}
                      aria-expanded={activeCat?.name === cat.name}
                      onFocus={() => handleCategoryHover(cat)}
                      onMouseEnter={() => handleCategoryHover(cat)}
                      onClick={() => setMenuOpen(false)}
                      title={cat.name}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-left font-medium tracking-wide transition-colors transition-transform duration-200 focus:outline-none capitalize whitespace-normal hover:bg-base-200 hover:text-primary hover:underline hover:scale-105 cursor-pointer ${activeCat?.name === cat.name ? 'bg-base-200 text-primary' : 'text-gray-800'}`}
                    >
                      {iconMap[cat.name] || null}
                      <span>{cat.name}</span>
                      {cat.subcategories?.length ? (
                        <ChevronRightIcon className="w-3 h-3 ml-auto" />
                      ) : null}
                    </Link>
                  ))}
                  {categories.length === 0 && <span>No categories found</span>}
                </div>
                {activeCat?.subcategories && activeCat.subcategories.length > 0 ? (
                  <ul className="min-w-[200px] pl-4 space-y-1 fade-in" role="menu">
                    {activeCat.subcategories.map((sub) => (
                      <li key={sub.name} className="capitalize" role="none">
                        <Link
                          href={`/categories/${encodeURIComponent(activeCat.name)}?type=${encodeURIComponent(sub.name)}`}
                          role="menuitem"
                          className="block font-medium text-gray-800 tracking-wide transition-colors transition-transform duration-200 whitespace-nowrap truncate hover:text-primary hover:underline hover:scale-105"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="min-w-[200px] pl-4 flex items-center text-sm text-gray-500">
                    No sub-categories
                  </div>
                )}
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div
        id="mobile-cat-menu"
        className={`md:hidden absolute left-0 top-full w-full z-40 bg-base-100 border border-base-200 shadow-lg rounded p-4 transition-all ${mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <ul className="space-y-2">
          {categories.map((cat) => (
            <details key={cat.name} className="border-b border-base-200 last:border-none">
              <summary
                title={cat.name}
                className="flex items-center gap-2 py-2 cursor-pointer list-none transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105 hover:bg-base-200 rounded"
              >
                {iconMap[cat.name] || null}
                <Link
                  href={`/categories/${encodeURIComponent(cat.name)}`}
                  className="capitalize line-clamp-2 whitespace-normal flex-1 cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              </summary>
              {cat.subcategories?.length && (
                <ul className="pl-4 py-2 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.name} className="capitalize">
                      <Link
                        href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub.name)}`}
                        className="block py-1 transition-colors transition-transform duration-200 hover:text-primary hover:underline hover:scale-105"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
          {categories.length === 0 && <li>No categories found</li>}
        </ul>
      </div>
    </>
  );
};

export default CategoryMenu; 