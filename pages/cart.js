import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Cart() {
  const { cart } = useContext(AppContext);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Cart</h1>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      <ul className="space-y-2">
        {cart.map(item => (
          <li key={item.ID} className="border p-2 flex justify-between">
            <span>{item.TITLE}</span>
            <span>Qty: {item.qty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
