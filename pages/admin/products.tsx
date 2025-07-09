import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Product, ProductInput, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import { TextInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import ConfirmModal from '@components/Modals/ConfirmModal';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import Link from 'next/link';
import EditButton from '@components/UI/EditButton';
import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import SelectDropdown, { SelectOption } from '@components/form-fields/SelectDropdown';
import GenericModal from '@components/Modals/GenericModal';
import debounce from 'lodash.debounce';

interface ProductsResponse {
  products: Product[];
  total: number;
}

export default function AdminProducts() {
  const { user } = useContext(AppContext)!;
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmAction, setConfirmAction] = useState<null | { type: 'add' | 'edit' | 'delete', payload?: any }>(null);
  const [disableModal, setDisableModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

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

  // Add state for dropdown options and modals
  const [tagOptions, setTagOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);
  const [addTagModal, setAddTagModal] = useState<{ open: boolean; value: string }>({ open: false, value: '' });
  const [addVendorModal, setAddVendorModal] = useState<{ open: boolean; value: string }>({ open: false, value: '' });
  const [addCategoryModal, setAddCategoryModal] = useState<{ open: boolean; value: string }>({ open: false, value: '' });
  const [addTypeModal, setAddTypeModal] = useState<{ open: boolean; value: string }>({ open: false, value: '' });

  const fetchProducts = useCallback(async (page: number = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { q: searchTerm }),
        ...(sortBy && { sort: sortBy }),
      });
      const data = await fetchJson<ProductsResponse>(`/api/admin/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, sortBy]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // Async option loading for dropdowns
  const fetchVendors = async (input = '') => {
    const params = new URLSearchParams({ search: input, limit: '20' });
    const res = await fetch(`/api/vendors?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.vendors || []).map((v: any) => ({ label: v.brandName, value: v.id }));
  };
  const fetchCategories = async (input = '') => {
    const params = new URLSearchParams({ search: input, limit: '20' });
    const res = await fetch(`/api/categories?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.categories || []).map((c: any) => ({ label: c.name, value: c.id }));
  };
  const fetchTags = async (input = '') => {
    const params = new URLSearchParams({ search: input });
    const res = await fetch(`/api/tags?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tags || []).map((t: string) => ({ label: t, value: t }));
  };
  // For product types, fallback to static list if no endpoint
  const staticTypes = [
    { label: 'Physical', value: 'Physical' },
    { label: 'Digital', value: 'Digital' },
    { label: 'Service', value: 'Service' },
  ];
  const fetchTypes = async (input = '') => {
    // If you have an endpoint, replace this logic
    return staticTypes.filter((t) => t.label.toLowerCase().includes(input.toLowerCase()));
  };
  // Initial load
  useEffect(() => {
    fetchVendors().then(setVendorOptions);
    fetchCategories().then(setCategoryOptions);
    fetchTags().then(setTagOptions);
    fetchTypes().then(setTypeOptions);
  }, []);
  // Debounced search handlers
  const debouncedFetchVendors = debounce((input: string, cb: (opts: SelectOption[]) => void) => {
    fetchVendors(input).then(cb);
  }, 300);
  const debouncedFetchCategories = debounce((input: string, cb: (opts: SelectOption[]) => void) => {
    fetchCategories(input).then(cb);
  }, 300);
  const debouncedFetchTags = debounce((input: string, cb: (opts: SelectOption[]) => void) => {
    fetchTags(input).then(cb);
  }, 300);
  const debouncedFetchTypes = debounce((input: string, cb: (opts: SelectOption[]) => void) => {
    fetchTypes(input).then(cb);
  }, 300);

  // Add new handlers for each modal
  const handleAddVendor = async () => {
    const res = await fetch('/api/vendors/check-or-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addVendorModal.value }),
    });
    if (res.ok) {
      const data = await res.json();
      const newOption = { label: data.vendor.brandName, value: data.vendor.id };
      setVendorOptions((opts) => [...opts, newOption]);
      setForm((prev) => ({ ...prev, vendorId: newOption }));
    }
    setAddVendorModal({ open: false, value: '' });
  };
  const handleAddCategory = async () => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addCategoryModal.value }),
    });
    if (res.ok) {
      const data = await res.json();
      const newOption = { label: data.category?.name || addCategoryModal.value, value: data.category?.id || addCategoryModal.value };
      setCategoryOptions((opts) => [...opts, newOption]);
      setForm((prev) => ({ ...prev, categoryId: newOption }));
    }
    setAddCategoryModal({ open: false, value: '' });
  };
  const handleAddTag = async () => {
    // Optionally POST to /api/tags if supported, else just add locally
    const newOption = { label: addTagModal.value, value: addTagModal.value };
    setTagOptions((opts) => [...opts, newOption]);
    setForm((prev) => ({ ...prev, tags: [...(Array.isArray(prev.tags) ? prev.tags : []), newOption] }));
    setAddTagModal({ open: false, value: '' });
  };
  const handleAddType = async () => {
    // If you have an endpoint, POST here. Otherwise, just add locally
    const newOption = { label: addTypeModal.value, value: addTypeModal.value };
    setTypeOptions((opts) => [...opts, newOption]);
    setForm((prev) => ({ ...prev, productType: newOption }));
    setAddTypeModal({ open: false, value: '' });
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); fetchProducts(1); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  // Helper to extract value for submission
  const getValue = (option: any) => (option && typeof option === 'object' && 'value' in option ? option.value : option);
  const getMultiValues = (options: any) => Array.isArray(options) ? options.map(getValue) : [];
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    const payload = editingId ? { ...form, id: editingId } : form;
    fd.append('id', getValue(payload.id) || '');
    fd.append('sku', payload.sku || '');
    fd.append('title', payload.title || '');
    fd.append('vendorId', getValue(payload.vendorId) || '');
    fd.append('description', payload.description || '');
    fd.append('product_type', getValue(payload.productType) || '');
    fd.append('tags', getMultiValues(payload.tags).join(',') || '');
    fd.append('categoryId', getValue(payload.categoryId) || '');
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
      setShowModal(false);
      fetchProducts(currentPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(msg);
    }
  };
  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotos([]);
    setShowModal(true);
  };
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({ ...product });
    setShowModal(true);
  };
  const handleDelete = (productId: string) => setConfirmAction({ type: 'delete', payload: productId });
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotos([]);
    setShowModal(false);
  };
  const handleDisable = (product: Product) => setDisableModal({ open: true, product });
  const confirmDisable = async () => {
    if (!disableModal.product) return;
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: disableModal.product.id }),
    });
    setDisableModal({ open: false, product: null });
    fetchProducts(currentPage);
  };
  if (!user) return <div className="p-4">Please log in to view products.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  const totalPages = Math.ceil(total / 20);
  return (
    <>
      <Head>
        <title>{getPageTitle('Admin Products')}</title>
      </Head>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Product Management</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Manage all products across the platform. View, edit, and maintain product information.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600">Total: {total} products</p>
            </div>
            <button className="btn btn-primary text-white" onClick={handleAdd}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Product
            </button>
          </div>
        </div>
        <div className="mb-8">
          <div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="w-full md:w-auto flex-1">
              <div className="flex gap-2 w-full">
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 text-base bg-white placeholder-gray-400 transition" />
                <button type="submit" className="btn btn-primary text-white px-5 py-2 rounded-lg shadow">Search</button>
              </div>
            </form>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 text-base bg-white w-full md:w-auto transition">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="price_asc">Price Low-High</option>
              <option value="price_desc">Price High-Low</option>
            </select>
          </div>
        </div>
        {message && (<div className="alert alert-success mb-6"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>{message}</span></div>)}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><span className="ml-2">Loading products...</span></div></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No products found</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">
                        {product.vendor?.id ? (
                          <Link href={`/admin/brands`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition">
                            {product.vendor?.brandName || 'Unknown'}
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </Link>
                        ) : (
                          product.vendor?.brandName || 'Unknown'
                        )}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${((product.totalInventory ?? 0) <= 5) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {product.totalInventory ?? 0}
                          {(product.totalInventory ?? 0) <= 5 ? ' Low' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{product.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {user?.role === USER_ROLES.SUPER_ADMIN && (
                            <button
                              className="flex items-center gap-1 btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition px-3 py-1.5"
                              onClick={() => handleDisable(product)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                              Disable
                            </button>
                          )}
                          <button
                            className="flex items-center gap-1 btn btn-sm bg-red-500 text-white hover:bg-red-600 font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition px-3 py-1.5"
                            onClick={() => handleDelete(product.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (<div className="mt-8 flex justify-center"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>)}
      </div>
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={submit} className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput key="id" name="id" value={String(form.id || '')} onChange={handleChange} placeholder="ID" />
                  <TextInput key="sku" name="sku" value={String(form.sku || '')} onChange={handleChange} placeholder="SKU" />
                  <TextInput key="title" name="title" value={String(form.title || '')} onChange={handleChange} placeholder="Title" />
                  <TextInput key="description" name="description" value={String(form.description || '')} onChange={handleChange} placeholder="Description" />
                </div>
              </div>
              {/* Categorization Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Categorization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectDropdown
                    label="Vendor"
                    name="vendorId"
                    value={form.vendorId}
                    onChange={(val) => setForm((prev) => ({ ...prev, vendorId: val }))}
                    options={vendorOptions}
                    loadOptions={debouncedFetchVendors}
                    isAsync
                    onAddNew={(inputValue) => setAddVendorModal({ open: true, value: inputValue })}
                    addNewLabel="Add Vendor"
                    className="min-w-[180px] w-full md:w-auto"
                  />
                  <SelectDropdown
                    label="Category"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={(val) => setForm((prev) => ({ ...prev, categoryId: val }))}
                    options={categoryOptions}
                    loadOptions={debouncedFetchCategories}
                    isAsync
                    onAddNew={(inputValue) => setAddCategoryModal({ open: true, value: inputValue })}
                    addNewLabel="Add Category"
                    className="min-w-[180px] w-full md:w-auto"
                  />
                  <SelectDropdown
                    label="Product Type"
                    name="productType"
                    value={form.productType}
                    onChange={(val) => setForm((prev) => ({ ...prev, productType: val }))}
                    options={typeOptions}
                    loadOptions={debouncedFetchTypes}
                    isAsync
                    onAddNew={(inputValue) => setAddTypeModal({ open: true, value: inputValue })}
                    addNewLabel="Add Type"
                    className="min-w-[180px] w-full md:w-auto"
                  />
                  <SelectDropdown
                    label="Tags"
                    name="tags"
                    value={form.tags}
                    onChange={(val) => setForm((prev) => ({ ...prev, tags: val }))}
                    options={tagOptions}
                    isMulti
                    loadOptions={debouncedFetchTags}
                    isAsync
                    onAddNew={(inputValue) => setAddTagModal({ open: true, value: inputValue })}
                    addNewLabel="Add Tag"
                    className="min-w-[180px] w-full md:w-auto"
                  />
                </div>
              </div>
              {/* Pricing & Inventory Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Pricing & Inventory</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextInput key="quantity" name="quantity" value={String(form.quantity ?? 0)} onChange={handleChange} placeholder="Quantity" type="number" />
                  <TextInput key="minPrice" name="minPrice" value={String(form.minPrice ?? 0)} onChange={handleChange} placeholder="Min Price" type="number" />
                  <TextInput key="maxPrice" name="maxPrice" value={String(form.maxPrice ?? 0)} onChange={handleChange} placeholder="Max Price" type="number" />
                  <TextInput key="currency" name="currency" value={String(form.currency || '')} onChange={handleChange} placeholder="Currency" />
                </div>
              </div>
              {/* Images Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Product Images</h4>
                <input type="file" multiple accept="image/*" onChange={(e) => { const files = Array.from(e.target.files || []); setPhotos(files); }} className="file-input file-input-bordered w-full" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button>
                <button type="button" className="btn btn-ghost hover:bg-gray-100 hover:text-gray-800" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
      {/* Add Tag Modal */}
      <GenericModal
        isOpen={addTagModal.open}
        onClose={() => setAddTagModal({ open: false, value: '' })}
        title="Add New Tag"
        actions={
          <button className="btn btn-primary" onClick={handleAddTag}>Add</button>
        }
      >
        <div>Tag: <b>{addTagModal.value}</b></div>
      </GenericModal>
      {/* Add Vendor Modal */}
      <GenericModal
        isOpen={addVendorModal.open}
        onClose={() => setAddVendorModal({ open: false, value: '' })}
        title="Add New Vendor"
        actions={
          <button className="btn btn-primary" onClick={handleAddVendor}>Add</button>
        }
      >
        <div>Vendor: <b>{addVendorModal.value}</b></div>
      </GenericModal>
      {/* Add Category Modal */}
      <GenericModal
        isOpen={addCategoryModal.open}
        onClose={() => setAddCategoryModal({ open: false, value: '' })}
        title="Add New Category"
        actions={
          <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
        }
      >
        <div>Category: <b>{addCategoryModal.value}</b></div>
      </GenericModal>
      {/* Add Type Modal */}
      <GenericModal
        isOpen={addTypeModal.open}
        onClose={() => setAddTypeModal({ open: false, value: '' })}
        title="Add New Product Type"
        actions={
          <button className="btn btn-primary" onClick={handleAddType}>Add</button>
        }
      >
        <div>Type: <b>{addTypeModal.value}</b></div>
      </GenericModal>
      {confirmAction && confirmAction.type === 'delete' && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title={`Confirm Delete`}
          description={`Are you sure you want to delete this product?`}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {
            // call delete logic with confirmAction.payload
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {disableModal.open && disableModal.product && (
        <ConfirmModal
          isOpen={disableModal.open}
          title="Disable Product"
          description={`Are you sure you want to disable '${disableModal.product.title}' (Brand: ${disableModal.product.vendor?.brandName || 'Unknown'})?`}
          confirmLabel="Disable"
          cancelLabel="Cancel"
          onConfirm={confirmDisable}
          onCancel={() => setDisableModal({ open: false, product: null })}
        />
      )}
    </>
  );
}

AdminProducts.getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
