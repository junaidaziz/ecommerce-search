import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import { Product, ProductInput, ApiMessage, USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import { TextInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import ConfirmModal from '@components/ConfirmModal';

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

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); fetchProducts(1); };
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
      setShowModal(false);
      fetchProducts(currentPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(msg);
    }
  };
  const handleAdd = () => setConfirmAction({ type: 'add' });
  const handleEdit = (product: Product) => setConfirmAction({ type: 'edit', payload: product });
  const handleDelete = (productId: string) => setConfirmAction({ type: 'delete', payload: productId });
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotos([]);
    setShowModal(false);
  };
  if (!user) return <div className="p-4">Please log in to view products.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN) return <div className="p-4">Admin access required.</div>;
  const totalPages = Math.ceil(total / 20);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Head>
        <title>{getPageTitle('Admin Products')}</title>
      </Head>
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input input-bordered flex-1" />
                <button type="submit" className="btn btn-primary text-white">Search</button>
              </div>
            </form>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select select-bordered">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (<tr><td colSpan={7} className="px-6 py-4 text-center"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><span className="ml-2">Loading products...</span></div></td></tr>) : products.length === 0 ? (<tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No products found</td></tr>) : (products.map((product) => (<tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150"><td className="px-6 py-4"><div className="flex items-center"><div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-lg object-cover" src={typeof product.featuredImage === 'string' ? product.featuredImage : product.featuredImage?.url || '/placeholder.png'} alt={product.title} /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{product.title}</div><div className="text-sm text-gray-500">SKU: {product.sku}</div></div></div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.vendor?.brandName || 'Unknown'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{product.minPrice}{product.maxPrice && product.maxPrice > product.minPrice && (<span className="text-gray-500"> - £{product.maxPrice}</span>)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.totalInventory || 0}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.status || 'INACTIVE'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-2"><button className="btn btn-primary text-white" onClick={() => handleEdit(product)}>Edit</button><button className="btn btn-error text-white" onClick={() => handleDelete(product.id)}>Delete</button></div></td></tr>)))}</tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (<div className="mt-8 flex justify-center"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>)}
      </div>
      {showModal && (<dialog open className="modal"><div className="modal-box max-w-2xl"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3><form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{['id','sku','title','vendorId','description','productType','tags','categoryId','quantity','minPrice','maxPrice','currency'].map((field) => (<TextInput key={field} name={field as keyof FormState} value={String(form[field as keyof FormState] || '')} onChange={handleChange} placeholder={field} />))}</div><div><label className="label"><span className="label-text">Product Images</span></label><input type="file" multiple accept="image/*" onChange={(e) => { const files = Array.from(e.target.files || []); setPhotos(files); }} className="file-input file-input-bordered w-full" /></div><div className="flex gap-2 pt-4"><button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button><button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button></div></form></div></dialog>)}
      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title={`Confirm ${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}`}
          description={`Are you sure you want to ${confirmAction.type} this product?`}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (confirmAction.type === 'add') { /* call add logic */ }
            if (confirmAction.type === 'edit') { /* call edit logic with confirmAction.payload */ }
            if (confirmAction.type === 'delete') { /* call delete logic with confirmAction.payload */ }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
