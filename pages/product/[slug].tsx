import { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import ProductImageSlider from '../../components/ProductImageSlider';
import RecommendedProducts from '../../components/RecommendedProducts';
import { getProductBySlug, getReviewsForProduct, getAverageRating } from '../../lib/db';
import { mapDbRowToProduct } from '../../lib/products';

export async function getServerSideProps({ params }) {
  const row = getProductBySlug(params.slug);
  if (!row) {
    return { notFound: true };
  }
  const product = mapDbRowToProduct(row);
  const reviews = getReviewsForProduct(String(row.id));
  const stats = getAverageRating(String(row.id));
  return {
    props: {
      product,
      initialReviews: reviews,
      initialAverage: stats.average,
      initialCount: stats.count,
    },
  };
}

export default function ProductDetail({ product, initialReviews, initialAverage, initialCount }) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } = useContext(AppContext);
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [reviewCount, setReviewCount] = useState(initialCount);
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState('');
  const id = product.ID;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('browse-history') || '[]');
      const updated = [id, ...stored.filter((v: string) => v !== id)];
      localStorage.setItem('browse-history', JSON.stringify(updated.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [id]);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto bg-base-100 rounded-box shadow-md">
      <Head>
        <title>{product.TITLE} - Product</title>
        <meta name="description" content={product.DESCRIPTION_TEXT?.slice(0, 150)} />
      </Head>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          <ProductImageSlider
            images={product.IMAGES && product.IMAGES.length > 0 ? product.IMAGES : [product.FEATURED_IMAGE?.url]}
            imgClass="max-h-96 hover:scale-110 transition w-full"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-4">{product.TITLE}</h1>
          <p className="mb-2">Vendor: {product.VENDOR}</p>
          <p className="mb-2">Type: {product.PRODUCT_TYPE}</p>
          <p className="mb-4">{product.DESCRIPTION_TEXT || product.BODY_HTML_TEXT || 'No description available.'}</p>
          <p className="text-lg font-bold mb-4">{product.CURRENCY} {parseFloat(product.MIN_PRICE).toFixed(2)}</p>
          <p className="mb-2">Rating: {averageRating.toFixed(1)} ({reviewCount})</p>
          <div className="flex gap-2">
            <button className="btn btn-primary transition-all duration-200" onClick={() => addToCart(product)}>Add to Cart</button>
            {wishlist.some((w) => w.ID === product.ID) ? (
              <button className="btn transition-all duration-200" onClick={() => removeFromWishlist(product.ID)}>Remove Wishlist</button>
            ) : (
              <button className="btn transition-all duration-200" onClick={() => addToWishlist(product)}>Add Wishlist</button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 w-full">
        <h3 className="font-semibold mb-2">Reviews</h3>
        {reviews.map((r, i) => (
          <div key={i} className="border-b py-2 text-sm">
            <p className="font-medium">{r.userEmail}</p>
            <p>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} - {r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {user && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: myRating, comment }),
              });
              if (res.ok) {
                const data = await res.json();
                setAverageRating(data.averageRating);
                setReviewCount(data.reviewCount);
                const rres = await fetch(`/api/products/${id}/reviews`);
                if (rres.ok) {
                  const rdata = await rres.json();
                  setReviews(rdata.reviews);
                }
                setComment('');
                setMyRating(5);
              }
            }}
            className="mt-4 space-y-2"
          >
            <div>
              <label className="mr-2">Rating</label>
              <select value={myRating} onChange={(e) => setMyRating(parseInt(e.target.value))} className="select select-bordered">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <textarea className="textarea textarea-bordered w-full" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review" />
            <button className="btn btn-sm btn-primary transition-all duration-200" type="submit">Submit Review</button>
          </form>
        )}
      </div>
      <RecommendedProducts category={product.CATEGORY} excludeId={product.ID} />
      <div className="mt-4">
        <Link href="/">&larr; Back to products</Link>
      </div>
    </div>
  );
}
