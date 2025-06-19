import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../contexts/AppContext';

export default function Checkout() {
  const router = useRouter();
  const { cart, user } = useContext(AppContext);
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce(
    (s, i) => s + i.qty * parseFloat(i.MIN_PRICE || 0),
    0
  );

  if (!user) return <div className="p-4">Please log in to checkout.</div>;
  if (cart.length === 0) return <div className="p-4">Your cart is empty.</div>;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          email: user.email,
          shippingName: name,
          shippingAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || 'Order failed');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <ul className="space-y-2 mb-4">
        {cart.map((item) => {
          const price = parseFloat(item.MIN_PRICE || 0);
          const subtotal = price * item.qty;
          return (
            <li key={item.ID} className="border p-2 flex justify-between">
              <div>
                <p className="font-medium">{item.TITLE}</p>
                <p className="text-sm">
                  £{price.toFixed(2)} x {item.qty}
                </p>
              </div>
              <span>£{subtotal.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>
      <div className="border-t pt-4 mb-4 flex justify-between">
        <p className="font-semibold">Items: {itemCount}</p>
        <p className="font-semibold">Total: £{totalPrice.toFixed(2)}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            className="textarea textarea-bordered w-full"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}
