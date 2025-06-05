import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Cart() {
  const { cart, changeQty, removeFromCart } = useContext(AppContext);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Cart</h1>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      <ul className="space-y-2">
        {cart.map(item => (
          <li key={item.ID} className="border p-2 flex justify-between items-center">
            <span>{item.TITLE}</span>
            <div className="flex items-center space-x-2">
              <button className="btn btn-xs" onClick={() => changeQty(item.ID, -1)}>-</button>
              <span>{item.qty}</span>
              <button className="btn btn-xs" onClick={() => changeQty(item.ID, 1)}>+</button>
              <button className="btn btn-xs btn-error" onClick={() => removeFromCart(item.ID)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
