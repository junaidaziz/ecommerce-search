import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function Products() {
  const { addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/search');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.results);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    const price = parseFloat(p.MIN_PRICE || 0);
    if (minPrice && price < parseFloat(minPrice)) return false;
    if (maxPrice && price > parseFloat(maxPrice)) return false;
    return true;
  });

  return (
    <div className="p-6 w-full bg-gradient-to-br from-base-200 to-base-100 min-h-screen">
      {loading ? (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Products</h1>
          <div className="mb-4 flex gap-4">
            <div>
              <label
                htmlFor="minPrice"
                className="block text-sm font-medium mb-1"
              >
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                className="input input-bordered w-full"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="maxPrice"
                className="block text-sm font-medium mb-1"
              >
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                className="input input-bordered w-full"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.ID}
                className="bg-base-100 rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition"
              >
                <h2 className="font-semibold text-primary mb-1">{p.TITLE}</h2>
                <p className="mb-2 text-sm text-base-content/60">{p.VENDOR}</p>
                <button
                  className="btn btn-sm btn-secondary mt-auto"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
