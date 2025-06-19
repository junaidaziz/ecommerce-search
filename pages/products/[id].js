import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Link from 'next/link';
import Head from 'next/head';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } =
    useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setProduct(data);
        const revRes = await fetch(`/api/products/${id}/reviews`);
        if (revRes.ok) {
          const rdata = await revRes.json();
          setReviews(rdata.reviews);
          setAverageRating(rdata.averageRating);
          setReviewCount(rdata.reviewCount);
        }
      } catch (e) {
        setError('Failed to load product');
      }
    }
    load();
  }, [id]);

  if (error) return <div className="p-4">{error}</div>;
  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto bg-base-100 rounded-box shadow-md">
      <Head>
        <title>{product.TITLE} - Product</title>
        <meta
          name="description"
          content={product.DESCRIPTION_TEXT?.slice(0, 150)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.TITLE,
              description: product.DESCRIPTION_TEXT,
              image: product.FEATURED_IMAGE?.url,
              offers: {
                '@type': 'Offer',
                priceCurrency: product.CURRENCY,
                price: product.MIN_PRICE,
                availability:
                  product.TOTAL_INVENTORY > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      </Head>
      <h1 className="text-2xl font-bold mb-4">{product.TITLE}</h1>
      <div className="mb-4 w-full flex flex-col items-center">
        <div className="relative">
          <img
            src={
              product.IMAGES?.[currentImage] ||
              product.FEATURED_IMAGE?.url ||
              'https://placehold.co/600x400?text=No+Image'
            }
            alt={product.TITLE}
            className="object-cover max-h-96 hover:scale-110 transition"
          />
        </div>
        {product.IMAGES && product.IMAGES.length > 1 && (
          <div className="flex gap-2 mt-2">
            <button
              className="btn btn-xs"
              onClick={() =>
                setCurrentImage(
                  (currentImage - 1 + product.IMAGES.length) %
                    product.IMAGES.length
                )
              }
            >
              Prev
            </button>
            <button
              className="btn btn-xs"
              onClick={() =>
                setCurrentImage((currentImage + 1) % product.IMAGES.length)
              }
            >
              Next
            </button>
          </div>
        )}
      </div>
      <p className="mb-2">Vendor: {product.VENDOR}</p>
      <p className="mb-2">Type: {product.PRODUCT_TYPE}</p>
      <p className="mb-4">
        {product.DESCRIPTION_TEXT ||
          product.BODY_HTML_TEXT ||
          'No description available.'}
      </p>
      <p className="text-lg font-bold mb-4">
        {product.CURRENCY} {parseFloat(product.MIN_PRICE).toFixed(2)}
      </p>
      <p className="mb-2">
        Rating: {averageRating.toFixed(1)} ({reviewCount})
      </p>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
        {wishlist.some((w) => w.ID === product.ID) ? (
          <button
            className="btn"
            onClick={() => removeFromWishlist(product.ID)}
          >
            Remove Wishlist
          </button>
        ) : (
          <button className="btn" onClick={() => addToWishlist(product)}>
            Add Wishlist
          </button>
        )}
      </div>
      <div className="mt-6 w-full">
        <h3 className="font-semibold mb-2">Reviews</h3>
        {reviews.map((r, i) => (
          <div key={i} className="border-b py-2 text-sm">
            <p className="font-medium">{r.userEmail}</p>
            <p>
              {'★'.repeat(r.rating)}
              {'☆'.repeat(5 - r.rating)} - {r.comment}
            </p>
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
              <select
                value={myRating}
                onChange={(e) => setMyRating(parseInt(e.target.value))}
                className="select select-bordered"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a review"
            />
            <button className="btn btn-sm btn-primary" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </div>
      <div className="mt-4">
        <Link href="/">&larr; Back to products</Link>
      </div>
    </div>
  );
}
