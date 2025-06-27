import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { AppContext } from '../../contexts/AppContext';
import ProductImageSlider from '../../components/Product/ProductImageSlider';
import RecommendedProducts from '../../components/Product/RecommendedProducts';
import {
  getProductBySlug,
  getReviewsForProduct,
  getAverageRating,
} from '../../lib/db';
import { mapDbRowToProduct } from '../../lib/products';
import { Product, Review } from '../../types';
import { SelectDropdown, Textarea } from '../../components/form-fields';
import { serializeDates } from '../../lib/utils/serializeDates';

type ProductDetailProps = {
  product: Product;
  initialReviews: Review[];
  initialAverage: number;
  initialCount: number;
};

// --- getServerSideProps ---
export const getServerSideProps: GetServerSideProps<
  ProductDetailProps
> = async (context: GetServerSidePropsContext) => {
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
      product: serializeDates(product),
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
  type ReviewForm = { rating: number; comment: string };
  const { register, handleSubmit, reset, watch, control } = useForm<ReviewForm>(
    {
      defaultValues: { rating: 5, comment: '' },
    }
  );
  const myRating = watch('rating');
  const id = product?.id;

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem('browse-history') || '[]'
      );
      const updated = [id, ...stored.filter((v) => v !== id)];
      localStorage.setItem(
        'browse-history',
        JSON.stringify(updated.slice(0, 20))
      );
    } catch {
      // ignore
    }
  }, [id]);

  if (!appCtx) return null;
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } =
    appCtx;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto bg-base-100 rounded-box shadow-md min-h-screen">
      <Head>
        <title>{getPageTitle(product.title || 'Product')}</title>
        <meta
          name="description"
          content={product.descriptionText?.slice(0, 150)}
        />
      </Head>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          <ProductImageSlider
            className="w-11/12 md:w-10/12 mx-auto max-h-80 md:max-h-96"
            images={
              product.images && product.images.length > 0
                ? product.images
                : product.featuredImage
                  ? [product.featuredImage]
                  : []
            }
            imgClass="hover:scale-110 transition"
            aspectRatioClass="aspect-square md:aspect-[4/3]"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
          <p className="mb-2">
            Vendor: {product.vendor?.brandName ?? 'Unknown'}
          </p>
          <p className="mb-2">SKU: {product.sku || 'N/A'}</p>
          <p className="mb-2">Type: {product.productType || 'N/A'}</p>
          <p className="mb-4">
            {product.descriptionText ||
              product.bodyHtmlText ||
              'No description available.'}
          </p>
          <p className="text-lg font-bold mb-4">
            {product.currency}{' '}
            {parseFloat(
              typeof product.minPrice === 'number'
                ? product.minPrice.toString()
                : product.minPrice || '0'
            ).toFixed(2)}
          </p>
          <p className="mb-2 font-medium">
            Stock:{' '}
            {product.totalInventory && product.totalInventory > 10
              ? 'In Stock'
              : product.totalInventory && product.totalInventory > 0
              ? 'Low Stock'
              : 'Out of Stock'}
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
            {wishlist?.some((w) => w.product.id === product.id) ? (
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
            onSubmit={handleSubmit(async (data) => {
              const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                const response = await res.json();
                setAverageRating(response.averageRating);
                setReviewCount(response.reviewCount);
                const rres = await fetch(`/api/products/${id}/reviews`);
                if (rres.ok) {
                  const rdata = await rres.json();
                  setReviews(rdata.reviews);
                }
                reset({ rating: 5, comment: '' });
              }
            })}
            className="mt-4 space-y-2"
          >
            <div>
              <label className="mr-2">Rating</label>
              <SelectDropdown
                name="rating"
                control={control}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  label: String(n),
                  value: String(n),
                }))}
                rules={{ valueAsNumber: true }}
                className="max-w-xs"
              />
            </div>
            <Textarea
              className="w-full"
              placeholder="Write a review"
              register={register}
              name="comment"
            />
            <button
              className="btn btn-sm btn-primary transition-all duration-200"
              type="submit"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
      {product.category && (
        <RecommendedProducts
          category={product.category.name}
          excludeId={product.id}
          limit={5}
        />
      )}
      <div className="mt-4">
        <Link href="/products">&larr; Back to products</Link>
      </div>
    </div>
  );
}
