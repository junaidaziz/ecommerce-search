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
  Electronics: <ElectronicsIcon className="h-5 w-5 mr-2" />,
  Fashion: <FashionIcon className="h-5 w-5 mr-2" />,
  Home: <HomeIcon className="h-5 w-5 mr-2" />,
  Toys: <ToysIcon className="h-5 w-5 mr-2" />,
  Sports: <SportsIcon className="h-5 w-5 mr-2" />,
};

// Recursive subcategory renderer
function SubcategoryList({
  parent,
  subcategories,
  activePath = [],
  onHover,
  onClick,
  level = 1,
}: {
  parent: string;
  subcategories: any[];
  activePath?: string[];
  onHover: (path: string[]) => void;
  onClick: () => void;
  level?: number;
}) {
  return (
    <div className={`space-y-2 pl-${level * 4}`}> {/* Indent for each level */}
      {subcategories.map((sub) => {
        const isActive = activePath[level] === sub.name;
        const hasChildren = Array.isArray(sub.subcategories) && sub.subcategories.length > 0;
        return (
          <div key={sub.name}>
            <div
              className={`flex items-center px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 capitalize
                ${isActive ? 'bg-primary/10 text-primary' : 'text-base-content/80 hover:bg-primary/5 hover:text-primary'}`}
              onMouseEnter={() => onHover([...activePath.slice(0, level), sub.name])}
              onFocus={() => onHover([...activePath.slice(0, level), sub.name])}
              onClick={onClick}
              tabIndex={0}
            >
              <span className="flex-1">{sub.name}</span>
              {hasChildren && <ChevronRightIcon className="w-4 h-4 ml-2 text-base-content/60" />}
            </div>
            {hasChildren && isActive && (
              <SubcategoryList
                parent={parent}
                subcategories={sub.subcategories}
                activePath={activePath}
                onHover={onHover}
                onClick={onClick}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label="Toggle categories"
        className="md:hidden btn btn-ghost btn-sm"
        aria-controls="mobile-cat-menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((p) => !p)}
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Desktop Categories Menu */}
      <div className="hidden md:block relative">
        <div onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
          <button
            type="button"
            aria-label="Categories menu"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-base-200 hover:text-primary"
            onClick={() => setMenuOpen((prev) => !prev)}
            onMouseEnter={handleMenuEnter}
          >
            Categories
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {/* Mega Menu Dropdown */}
          <div
            id="mega-menu"
            role="menu"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
            className={`absolute left-0 top-full mt-2 z-50 bg-base-100 border border-base-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-200 transform ${
              menuOpen 
                ? 'visible opacity-100 translate-y-0 scale-100' 
                : 'invisible opacity-0 -translate-y-2 scale-95'
            }`}
            aria-hidden={!menuOpen}
          >
            <div className="flex min-w-[600px] max-w-4xl">
              {/* Categories List */}
              <div className="w-1/2 p-6 border-r border-base-200 bg-base-50">
                <h3 className="text-lg font-semibold mb-4 text-base-content">Categories</h3>
                <div className="space-y-2">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 focus:outline-none capitalize whitespace-normal hover:bg-primary/10 hover:text-primary cursor-pointer ${
                        activeCat?.name === cat.name 
                          ? 'bg-primary/20 text-primary shadow-sm' 
                          : 'text-base-content'
                      }`}
                    >
                      {iconMap[cat.name] || <div className="w-5 h-5 mr-2" />}
                      <span className="flex-1">{cat.name}</span>
                      {cat.subcategories?.length ? (
                        <ChevronRightIcon className="w-4 h-4 text-base-content/60" />
                      ) : null}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-4 py-3 text-base-content/60">
                      No categories found
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategories Panel */}
              <div className="w-1/2 p-6">
                {activeCat ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      {iconMap[activeCat.name] || <div className="w-6 h-6" />}
                      <h3 className="text-lg font-semibold capitalize">{activeCat.name}</h3>
                    </div>
                    {activeCat.subcategories && activeCat.subcategories.length > 0 ? (
                      <SubcategoryList
                        parent={activeCat.name}
                        subcategories={activeCat.subcategories}
                        activePath={[activeCat.name]}
                        onHover={() => {}}
                        onClick={() => setMenuOpen(false)}
                        level={1}
                      />
                    ) : (
                      <div className="px-4 py-3 text-base-content/60">
                        No sub-categories available
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-base-content/60">
                    Select a category to view subcategories
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Categories Menu */}
      <div
        id="mobile-cat-menu"
        className={`md:hidden absolute left-0 top-full w-full z-40 bg-base-100 border border-base-200 shadow-xl rounded-2xl transition-all duration-200 ${
          mobileOpen 
            ? 'max-h-[80vh] opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <details key={cat.name} className="group">
                <summary className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer list-none transition-all duration-200 hover:bg-base-200 group-open:bg-primary/10 group-open:text-primary">
                  {iconMap[cat.name] || <div className="w-5 h-5" />}
                  <span className="flex-1 capitalize font-medium">{cat.name}</span>
                  <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                {cat.subcategories?.length && (
                  <div className="pl-8 pr-4 py-2 space-y-1">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={`/categories/${encodeURIComponent(cat.name)}?type=${encodeURIComponent(sub.name)}`}
                        className="block px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary capitalize"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </details>
            ))}
            {categories.length === 0 && (
              <div className="px-4 py-3 text-base-content/60">
                No categories found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryMenu; 