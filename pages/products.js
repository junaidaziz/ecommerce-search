import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Products() {
  const { addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/search');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.results);
      }
    }
    load();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.ID} className="border rounded p-4 flex flex-col">
            <h2 className="font-semibold mb-2">{p.TITLE}</h2>
            <p className="mb-2">{p.VENDOR}</p>
            <button className="btn btn-sm btn-primary mt-auto" onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
