import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function UserOrders() {
  const { user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/orders')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(data));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
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
            <ul className="list-disc pl-4 text-sm mb-1">
              {o.items.map((item) => (
                <li key={item.ID}>
                  {item.TITLE} x {item.qty}
                </li>
              ))}
            </ul>
            <p>Total: £{o.total}</p>
          </li>
        ))}
        {orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
}
