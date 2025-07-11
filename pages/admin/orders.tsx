import { apiFetch } from '@lib/api';
import { useEffect, useState, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { AppContext } from '@contexts/AppContext';
import type { Order } from '@/types';
import { USER_ROLES } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Pagination from '@components/Pagination';
import SuperAdminSidebar from '@components/Layout/SuperAdminSidebar';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import PageHero from '@components/UI/PageHero';
import SearchFilterBar from '@components/common/SearchFilterBar';
import TableHeader, { TableColumn } from '@components/common/TableHeader';
import TableBody from '@components/common/TableBody';

export default function AdminOrders() {
  const { data: session } = useSession();
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    params.append('page', currentPage.toString());
    params.append('limit', '20');
    if (sortBy) params.append('sort', sortBy);
    
    apiFetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setOrders(data.orders || data);
        setTotal(data.total || data.length);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / 20));
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
      });
  }, [session, status, search, currentPage, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setCurrentPage(1); 
  };

  if (!user) return <div className="p-4">Please log in to view orders.</div>;
  if (user.role.toUpperCase() !== USER_ROLES.SUPER_ADMIN) 
    return <div className="p-4">Admin access required.</div>;

  // Table columns definition
  const orderTableColumns: TableColumn[] = [
    { label: 'Order' },
    { label: 'Customer' },
    { label: 'Product' },
    { label: 'Status' },
    { label: 'Total' },
    { label: 'Actions' },
  ];

  const orderSortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Total Low-High', value: 'total_asc' },
    { label: 'Total High-Low', value: 'total_desc' },
    { label: 'Status A-Z', value: 'status_asc' },
    { label: 'Status Z-A', value: 'status_desc' },
  ];
  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <>
      <Head>
        <title>{getPageTitle('Orders')}</title>
      </Head>
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Order Management</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Manage all orders across the platform. View, track, and maintain order information.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Orders</h2>
              <p className="text-gray-600 dark:text-gray-300">Total: {total} orders</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={e => setSearch(e.target.value)}
            onSearchSubmit={handleSearch}
            filterValue={orderSortOptions.find(opt => opt.value === sortBy) || orderSortOptions[0]}
            filterOptions={orderSortOptions}
            onFilterChange={val => { if (val) setSortBy(val.value); }}
            placeholder="Search orders..."
            buttonText="Search"
          />
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <TableHeader columns={orderTableColumns} />
            {loading && (
              <tbody>
                <tr>
                  <td colSpan={orderTableColumns.length} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
            <TableBody
              data={!loading ? orders : []}
              columns={orderTableColumns}
              emptyMessage={'No orders found'}
              renderRow={(order, idx) => ([
                <td key={order.id + '-order'} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                        #{order.id}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>,
                <td key={order.id + '-customer'} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {order.user?.email || order.customer?.email || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.user?.name || order.customer?.name || 'No name'}
                  </div>
                </td>,
                <td key={order.id + '-product'} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        className="h-12 w-12 rounded-lg object-cover" 
                        src={order.product?.featuredImage || '/placeholder.png'} 
                        alt={order.product?.title || 'Product'} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.product?.title || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {order.quantity || 1}
                      </div>
                    </div>
                  </div>
                </td>,
                <td key={order.id + '-status'} className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>,
                <td key={order.id + '-total'} className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">${order.total?.toFixed(2) || '0.00'}</span>
                </td>,
                <td key={order.id + '-actions'} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 rounded-lg px-3 py-1.5 font-semibold shadow-sm transition">View</button>
                </td>
              ])}
            />
          </table>
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </>
  );
}

(AdminOrders as any).getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
