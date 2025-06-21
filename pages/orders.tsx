import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';

// Define types for order items and orders
type OrderItem = {
  id: string | number;
  title: string;
  qty: number;
};

type Order = {
  id: string | number;
  status: string;
  shipping_name?: string;
  shipping_address?: string;
  user_email?: string;
  items: OrderItem[];
  total: number;
};

type OrdersProps = {};

const Orders: React.FC<OrdersProps> = (_props) => {
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-2">
            <p>
              Order #{o.id} - {o.status}
            </p>
            {o.shipping_name && (
              <p className="text-sm">Ship To: {o.shipping_name}</p>
            )}
            {o.shipping_address && (
              <p className="text-sm">Address: {o.shipping_address}</p>
            )}
            {(user.role === 'super-admin' || user.role === 'brand') && (
              <p className="text-sm text-gray-600">Customer: {o.user_email}</p>
            )}
            <ul className="list-disc pl-4 text-sm mb-1">
              {o.items.map((item) => (
                <li key={item.id}>
                  {item.title} x {item.qty}
                </li>
              ))}
            </ul>
            <p>Total: £{o.total}</p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
};

export default Orders;
