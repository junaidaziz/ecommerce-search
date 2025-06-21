import { useContext } from 'react';
import { useRouter } from 'next/router';
import { AppContext, AppContextValue } from '../contexts/AppContext';

// Define the type for a cart item
type CartItem = {
  id: string | number;
  title: string;
  minPrice?: string;
  qty: number;
};


const Cart: React.FC = () => {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('AppContext is undefined. Make sure your component is wrapped in an AppContext.Provider.');
  }

  const { cart, changeQty, removeFromCart } = context;

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      item.qty *
        parseFloat(
          typeof item.minPrice === 'number'
            ? item.minPrice.toString()
            : item.minPrice || '0'
        ),
    0
  );

  return (
    <div className="max-w-3xl mx-auto min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Summary</h1>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      <ul className="space-y-2 mb-4">
        {cart.map((item) => {
          const price = parseFloat(
            typeof item.minPrice === 'number'
              ? item.minPrice.toString()
              : item.minPrice || '0'
          );
          const subtotal = price * item.qty;
          return (
            <li
              key={item.id}
              className="border p-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm">£{price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-xs"
                  onClick={() => changeQty(item.id, -1)}
                >
                  -
                </button>
                <span>{item.qty}</span>
                <button
                  className="btn btn-xs"
                  onClick={() => changeQty(item.id, 1)}
                >
                  +
                </button>
                <span className="ml-2">£{subtotal.toFixed(2)}</span>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => removeFromCart(item.id)}
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
          <button
            className="btn btn-primary"
            onClick={() => router.push('/checkout')}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
