import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Cart() {
  const { cart, changeQty, removeFromCart, placeOrder } =
    useContext(AppContext);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.qty * parseFloat(item.MIN_PRICE || 0),
    0
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Summary</h1>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      <ul className="space-y-2 mb-4">
        {cart.map((item) => {
          const price = parseFloat(item.MIN_PRICE || 0);
          const subtotal = price * item.qty;
          return (
            <li
              key={item.ID}
              className="border p-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{item.TITLE}</p>
                <p className="text-sm">£{price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-xs"
                  onClick={() => changeQty(item.ID, -1)}
                >
                  -
                </button>
                <span>{item.qty}</span>
                <button
                  className="btn btn-xs"
                  onClick={() => changeQty(item.ID, 1)}
                >
                  +
                </button>
                <span className="ml-2">£{subtotal.toFixed(2)}</span>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => removeFromCart(item.ID)}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {cart.length > 0 && (
        <div className="border-t pt-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">Total Items: {itemCount}</p>
            <p className="font-semibold">
              Total Price: £{totalPrice.toFixed(2)}
            </p>
          </div>
          <button className="btn btn-primary" onClick={placeOrder}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
