import { useContext, useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { AppContext } from '../../contexts/AppContext';
import ProductImageSlider from '../../components/ProductImageSlider';
import RecommendedProducts from '../../components/RecommendedProducts';
import { getProductBySlug, getReviewsForProduct, getAverageRating } from '../../lib/db';
import { mapDbRowToProduct } from '../../lib/products';
import { Product, Review } from '../../types';


type ProductDetailProps = {
  product: Product;
  initialReviews: Review[];
  initialAverage: number;
  initialCount: number;
};

// --- getServerSideProps ---
export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (context: GetServerSidePropsContext) => {
  const { params } = context;
  if (!params || typeof params.slug !== 'string') {
    return { notFound: true };
  }
  const row = await getProductBySlug(params.slug);
  if (!row) {
    return { notFound: true };
  }
  const product = mapDbRowToProduct(row);
  const reviews = await getReviewsForProduct(String(row.id));
  const stats = await getAverageRating(String(row.id));
  return {
    props: {
      product,
      initialReviews: reviews,
      initialAverage: stats.average,
      initialCount: stats.count,
    },
  };
};

// --- Component ---
export default function ProductDetail({
  product,
  initialReviews,
  initialAverage,
  initialCount,
}: ProductDetailProps) {
  const appCtx = useContext(AppContext);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [averageRating, setAverageRating] = useState<number>(initialAverage);
  const [reviewCount, setReviewCount] = useState<number>(initialCount);
  const [myRating, setMyRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const id = product.id;

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('browse-history') || '[]');
      const updated = [id, ...stored.filter((v) => v !== id)];
      localStorage.setItem('browse-history', JSON.stringify(updated.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [id]);

  if (!appCtx) return null;
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } = appCtx;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto bg-base-100 rounded-box shadow-md min-h-screen">
      <Head>
        <title>{product.title} - Product</title>
        <meta name="description" content={product.descriptionText?.slice(0, 150)} />
      </Head>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          <ProductImageSlider
            className="w-full max-w-md aspect-[4/5]"
            images={
              product.images && product.images.length > 0
                ? product.images
                : product.featuredImage
                ? [product.featuredImage]
                : []
            }
            imgClass="hover:scale-110 transition"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
          <p className="mb-2">Vendor: {product.vendor}</p>
          <p className="mb-2">SKU: {product.sku}</p>
          <p className="mb-2">Type: {product.productType}</p>
          <p className="mb-4">
            {product.descriptionText || product.bodyHtmlText || 'No description available.'}
          </p>
          <p className="text-lg font-bold mb-4">
            {product.currency}{' '}
            {parseFloat(
              typeof product.minPrice === 'number'
                ? product.minPrice.toString()
                : product.minPrice || '0'
            ).toFixed(2)}
          </p>
          <p className="mb-2">
            Rating: {averageRating.toFixed(1)} ({reviewCount})
          </p>
          <div className="flex gap-2">
            <button
              className="btn btn-primary transition-all duration-200"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
            {wishlist.some((w) => w.id === product.id) ? (
              <button
                className="btn transition-all duration-200"
                onClick={() => removeFromWishlist(product.id)}
              >
                Remove Wishlist
              </button>
            ) : (
              <button
                className="btn transition-all duration-200"
                onClick={() => addToWishlist(product)}
              >
                Add Wishlist
              </button>
            )}
          </div>
        </div>
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
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setMyRating(parseInt(e.target.value))}
                className="select select-bordered"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              placeholder="Write a review"
            />
            <button className="btn btn-sm btn-primary transition-all duration-200" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </div>
      <RecommendedProducts category={product.category} excludeId={product.id} />
      <div className="mt-4">
        <Link href="/">&larr; Back to products</Link>
      </div>
    </div>
  );
}
