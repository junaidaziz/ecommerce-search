import {
  useState,
  useEffect,
  useContext,
  useCallback,
  ChangeEvent,
} from 'react';
import Link from 'next/link';
import { AppContext } from '@contexts/AppContext';
import { Product, ProductInput, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import { TextInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { useRouter } from 'next/router';
import SuperAdminSidebar from '@components/Layout/SuperAdminSidebar';
import PageHero from '@components/UI/PageHero';

export default function Admin() {
  const { user } = useContext(AppContext)!;
  const router = useRouter();

  type FormState = Partial<ProductInput> & { id?: string };

  const emptyForm: FormState = {
    id: '',
    sku: '',
    title: '',
    vendorId: 0,
    description: '',
    productType: '',
    tags: '',
    categoryId: 0,
    quantity: 0,
    minPrice: 0,
    maxPrice: 0,
    currency: 'USD',
  };
  const [form, setForm] = useState<FormState>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [totalProductCount, setTotalProductCount] = useState<number | null>(null);
  const [totalProductError, setTotalProductError] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const data = await fetchJson<Product[]>(
      `/api/admin/products?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    setProducts(data);
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (user && user.role.toUpperCase() === USER_ROLES.SUPER_ADMIN) {
      setTotalProductCount(null);
      setTotalProductError('');
      fetch('/api/dashboard/total-products')
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();
          setTotalProductCount(data.count);
        })
        .catch(() => {
          setTotalProductError('Failed to load');
          setTotalProductCount(0);
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    const payload = editingId ? { ...form, id: editingId } : form;
    fd.append('id', payload.id || '');
    fd.append('sku', payload.sku || '');
    fd.append('title', payload.title || '');
    fd.append('vendorId', String(payload.vendorId || 0));
    fd.append('description', payload.description || '');
    fd.append('product_type', payload.productType || '');
    fd.append('tags', payload.tags || '');
    fd.append('categoryId', String(payload.categoryId || 0));
    fd.append('quantity', String(payload.quantity ?? 0));
    fd.append('min_price', String(payload.minPrice ?? 0));
    fd.append('max_price', String(payload.maxPrice ?? 0));
    fd.append('currency', payload.currency || '');
    photos.forEach((file) => fd.append('photos', file));
    try {
      await fetchJson<ApiMessage>('/api/admin/products', {
        method: editingId ? 'PUT' : 'POST',
        body: fd,
      });
      setMessage(editingId ? 'Product updated' : 'Product added');
      setForm(emptyForm);
      setEditingId(null);
      setPhotos([]);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(msg);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      sku: p.sku || '',
      title: p.title || '',
      vendorId: p.vendorId,
      description: p.description || '',
      productType: p.productType || '',
      tags: p.tags || '',
      categoryId: p.categoryId,
      quantity: p.totalInventory || 0,
      minPrice: p.minPrice || 0,
      maxPrice: p.maxPrice || 0,
      currency: p.currency || 'USD',
    });
    setPhotos([]);
    setEditingId(p.id);
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotos([]);
  };
  
  if (!user) {
    return <div className="p-4">Please log in to view your products.</div>;
  }
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN) {
    return <div className="p-4">Admin access required.</div>;
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'from-primary to-primary-dark',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary'
    },
    {
      title: 'Brand Management',
      description: 'Manage brands and vendor accounts',
      href: '/admin/brands',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-secondary to-secondary-dark',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary'
    },
    {
      title: 'Product Management',
      description: 'View and manage all products',
      href: '/admin/products',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-success to-success-dark',
      bgColor: 'bg-success-50',
      textColor: 'text-success'
    },
    {
      title: 'Order Management',
      description: 'View and manage all orders',
      href: '/admin/orders',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-success to-success-dark',
      bgColor: 'bg-success-50',
      textColor: 'text-success'
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and insights',
      href: '/admin/analytics',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-warning to-warning-dark',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning'
    },
    {
      title: 'Categories',
      description: 'Manage product categories',
      href: '/admin/categories',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-secondary to-secondary-dark',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary'
    },
    {
      title: 'Approvals',
      description: 'Review pending approvals',
      href: '/admin/approvals',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-warning to-warning-dark',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning'
    },
    {
      title: 'Policies',
      description: 'Manage platform policies',
      href: '/admin/policies',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-danger to-danger-dark',
      bgColor: 'bg-danger-50',
      textColor: 'text-danger'
    },
    {
      title: 'Support',
      description: 'Manage customer support tickets',
      href: '/admin/support',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      ),
      color: 'from-info to-info-dark',
      bgColor: 'bg-info-light/20',
      textColor: 'text-info'
    }
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <SuperAdminSidebar />
      <div className="flex-1 bg-white dark:bg-neutral-950 transition-colors duration-300">
        <Head>
          <title>{getPageTitle('Admin Dashboard')}</title>
        </Head>

        {/* Hero Section */}
        <PageHero
          heading="Admin Dashboard"
          description={`Welcome back, ${user.firstName || 'Administrator'}. Manage your platform, users, and business operations from one central location.`}
        />

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-dark/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral dark:text-neutral-400">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success-100 dark:bg-success-dark/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-success dark:text-success-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral dark:text-neutral-400">Active Brands</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">89</p>
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-warning-100 dark:bg-warning-dark/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-warning dark:text-warning-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral dark:text-neutral-400">Total Products</p>
                  {user.role.toUpperCase() === USER_ROLES.SUPER_ADMIN ? (
                    totalProductError ? (
                      <p className="text-2xl font-bold text-danger">{totalProductError}</p>
                    ) : totalProductCount === null ? (
                      <p className="text-2xl font-bold text-neutral-400 animate-pulse">...</p>
                    ) : (
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalProductCount}</p>
                    )
                  ) : (
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{products.length}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-dark/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-secondary dark:text-secondary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral dark:text-neutral-400">Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">£45,678</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Sections Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Admin Tools</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {adminSections.map((section) => (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group relative bg-card-light dark:bg-card-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border-light dark:border-border-dark overflow-hidden"
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 ${section.bgColor} dark:bg-gray-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <div className={section.textColor}>
                        {section.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <dialog open className="modal">
            <div className="modal-box max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'id',
                    'sku',
                    'title',
                    'vendorId',
                    'description',
                    'productType',
                    'tags',
                    'categoryId',
                    'quantity',
                    'minPrice',
                    'maxPrice',
                    'currency',
                  ].map((field) => (
                    <TextInput
                      key={field}
                      name={field as keyof FormState}
                      value={String(form[field as keyof FormState] || '')}
                      onChange={handleChange}
                      placeholder={field}
                    />
                  ))}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Product Images</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPhotos(files);
                    }}
                    className="file-input file-input-bordered w-full"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
}
