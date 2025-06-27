import { useRouter } from 'next/router';
import { useEffect, useState, useContext, FormEvent, ChangeEvent } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Link from 'next/link';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import ProductImageSlider from '../../components/Product/ProductImageSlider';
import type { Product } from '../../types';
import type {
  Review,
  ReviewsResponse,
  ReviewAddedResponse,
} from '../../types/review';
import { SelectDropdown, Textarea } from '../../components/form-fields';
import type { SelectOption } from '../../components/form-fields/SelectDropdown';

interface ProductDetailProps {}

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const appContext = useContext(AppContext);

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [myRating, setMyRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } =
    appContext ?? {};

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) {
          setError('Product not found');
          return;
        }
        if (!res.ok) throw new Error('Failed');
        const data: Product = await res.json();
        if (!data) {
          setError('Product not found');
          return;
        }
        setProduct(data);
        const revRes = await fetch(`/api/products/${id}/reviews`);
        if (revRes.ok) {
          const rdata: ReviewsResponse = await revRes.json();
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
    <div className="max-w-screen-2xl mx-auto bg-base-100 rounded-box shadow-md">
      <Head>
        <title>{getPageTitle(product?.title || 'Product')}</title>
        <meta
          name="description"
          content={product.descriptionText?.slice(0, 150)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.descriptionText,
              image: product.featuredImage?.url,
              offers: {
                '@type': 'Offer',
                priceCurrency: product.currency,
                price: product.minPrice,
                availability:
                  product.totalInventory && product.totalInventory > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      </Head>
      <h1 className="text-2xl font-bold mb-4">{product.title || 'Product'}</h1>
      <div className="mb-4 w-full flex flex-col items-center">
        <ProductImageSlider
          className="w-full"
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
      <p className="mb-2">Vendor: {product.vendor?.brandName ?? 'Unknown'}</p>
      <p className="mb-2">Type: {product.productType || 'N/A'}</p>
      <p className="mb-4">
        {product.descriptionText ||
          product.bodyHtmlText ||
          'No description available.'}
      </p>
      <p className="text-lg font-bold mb-4">
        {product.currency || ''}{' '}
        {product.minPrice ? product.minPrice.toFixed(2) : 'N/A'}
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
          className="btn btn-primary"
          onClick={() => addToCart?.(product)}
          disabled={!addToCart}
        >
          Add to Cart
        </button>
        {(wishlist ?? []).some((w: Product) => w.id === product.id) ? (
          <button
            className="btn"
            onClick={() => removeFromWishlist?.(product.id)}
          >
            Remove Wishlist
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => addToWishlist?.(product)}
            disabled={!addToWishlist}
          >
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
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: myRating, comment }),
              });
              if (res.ok) {
                const data: ReviewAddedResponse = await res.json();
                setAverageRating(data.averageRating);
                setReviewCount(data.reviewCount);
                const rres = await fetch(`/api/products/${id}/reviews`);
                if (rres.ok) {
                  const rdata: ReviewsResponse = await rres.json();
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
              <SelectDropdown
                name="rating"
                value={{ label: String(myRating), value: String(myRating) }}
                onChange={(opt) =>
                  setMyRating(
                    opt ? parseInt((opt as SelectOption).value) : 5
                  )
                }
                options={[1, 2, 3, 4, 5].map((n) => ({
                  label: String(n),
                  value: String(n),
                }))}
                className="max-w-xs"
              />
            </div>
            <Textarea
              name="comment"
              className="w-full"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              placeholder="Write a review"
            />
            <button className="btn btn-sm btn-primary" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </div>
      <div className="mt-4">
        <Link href="/products">&larr; Back to products</Link>
      </div>
    </div>
  );
};

export default ProductDetail;
