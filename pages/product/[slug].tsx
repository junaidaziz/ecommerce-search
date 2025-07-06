import { apiFetch } from '@lib/api';
import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { AppContext } from '@contexts/AppContext';
import ProductImageSlider from '@components/Product/ProductImageSlider';
import RecommendedProducts from '@components/Product/RecommendedProducts';
import {
  getProductBySlug,
  getReviewsForProduct,
  getAverageRating,
} from '@lib/db';
import { mapDbRowToProduct } from '@lib/products';
import { Product, Review } from '@/types';
import { SelectDropdown, Textarea } from '@components/form-fields';
import { serializeDates } from '@utils/serializeDates';
import CheckCircleIcon from '@components/icons/CheckCircleIcon';
import WarningIcon from '@components/icons/WarningIcon';
import CartIcon from '@components/icons/CartIcon';
import ChevronLeftIcon from '@components/icons/ChevronLeftIcon';

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
  const [quantity, setQuantity] = useState<number>(1);
  type ReviewForm = { rating: number; comment: string };
  const { register, handleSubmit, reset, watch, control } = useForm<ReviewForm>(
    {
      defaultValues: { rating: 5, comment: '' },
    }
  );
  const myRating = watch('rating');
  const id = product?.id;

  const [variantId, setVariantId] = useState<string>('');

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
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    removeFromCart,
    changeQty,
    isInCart,
    getCartItemQuantity,
    wishlist, 
    user 
  } = appCtx;
  const selectedVariant = product.variants?.find(
    (v) => String(v.id) === variantId
  );

  const isInWishlist = wishlist?.some((w) => w.product.id === product.id);
  const isProductInCart = isInCart(product.id, selectedVariant?.id);
  const cartItemQuantity = getCartItemQuantity(product.id, selectedVariant?.id);
  

  const stockStatus = product.totalInventory && product.totalInventory > 10
    ? 'In Stock'
    : product.totalInventory && product.totalInventory > 0
      ? 'Low Stock'
      : 'Out of Stock';

  const price = parseFloat(
    typeof product.minPrice === 'number'
      ? product.minPrice.toString()
      : product.minPrice || '0'
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <Head>
        <title>{getPageTitle(product.title || 'Product')}</title>
        <meta
          name="description"
          content={product.descriptionText?.slice(0, 150)}
        />
      </Head>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center space-x-2 text-sm text-base-content/70 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-base-content font-medium">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-2xl shadow-lg p-6">
              <ProductImageSlider
                className="w-full aspect-square"
                images={
                  product.images && product.images.length > 0
                    ? product.images
                    : product.featuredImage
                      ? [product.featuredImage]
                      : []
                }
                imgClass="hover:scale-105 transition-transform duration-300 rounded-xl"
                aspectRatioClass="aspect-square"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-base-content/70">
                    <span>Vendor: {product.vendor?.brandName ?? 'Unknown'}</span>
                    <span>•</span>
                    <span>SKU: {product.sku || 'N/A'}</span>
                  </div>
                </div>
                <button
                  onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                  className={`btn btn-circle btn-sm transition-all duration-200 ${
                    isInWishlist 
                      ? 'btn-primary text-primary-content' 
                      : 'btn-ghost hover:btn-primary'
                  }`}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>

                             {/* Rating */}
               <div className="flex items-center space-x-2">
                 <div className="flex items-center">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <svg
                       key={star}
                       className={`w-5 h-5 ${
                         star <= averageRating
                           ? 'text-yellow-400 fill-current'
                           : 'text-gray-300'
                       }`}
                       viewBox="0 0 24 24"
                     >
                       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                     </svg>
                   ))}
                 </div>
                 <span className="text-sm text-base-content/70">
                   {averageRating.toFixed(1)} ({reviewCount} reviews)
                 </span>
               </div>
            </div>

            {/* Price and Stock */}
            <div className="bg-base-200/50 rounded-xl p-6 space-y-4">
                             <div className="flex items-baseline space-x-2">
                 <span className="text-4xl font-bold text-primary">
                   {product.currency} {price}
                 </span>
               </div>

               <div className="flex items-center space-x-2">
                 {stockStatus === 'In Stock' ? (
                   <CheckCircleIcon className="w-5 h-5 text-green-500" />
                 ) : stockStatus === 'Low Stock' ? (
                   <WarningIcon className="w-5 h-5 text-yellow-500" />
                 ) : (
                   <WarningIcon className="w-5 h-5 text-red-500" />
                 )}
                 <span className={`font-medium ${
                   stockStatus === 'In Stock' ? 'text-green-600' :
                   stockStatus === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
                 }`}>
                   {stockStatus}
                 </span>
                 {product.totalInventory && (
                   <span className="text-sm text-base-content/70">
                     ({product.totalInventory} available)
                   </span>
                 )}
               </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-base-content">
                  Select Variant
                </label>
                <select
                  className="select select-bordered w-full"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                >
                  <option value="">Choose an option</option>
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(', ')} - Stock {v.quantity}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cart Actions */}
            <div className="space-y-4">
              {isProductInCart ? (
                // Product is in cart - show quantity controls and remove button
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content">
                      Quantity in Cart
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {cartItemQuantity}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => changeQty(String(product.id), -1, selectedVariant?.id)}
                      disabled={cartItemQuantity <= 1}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-outline flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200"
                      onClick={() => changeQty(String(product.id), 1, selectedVariant?.id)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-error text-white hover:bg-red-700 hover:scale-105 transition-all duration-200"
                      onClick={() => removeFromCart(String(product.id), selectedVariant?.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                // Product not in cart - show add to cart
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-base-content">
                      Quantity
                    </label>
                    <div className="flex items-center border border-base-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-r border-base-300"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center bg-base-100">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-green-50 hover:text-green-600 transition-all duration-200 border-l border-base-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-lg w-full transition-all duration-200 hover:scale-105"
                    onClick={() => addToCart(product, selectedVariant)}
                    disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || stockStatus === 'Out of Stock'}
                  >
                    <CartIcon className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>

            {/* Product Type */}
            {product.productType && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-base-content/70">Type:</span>
                <span className="badge badge-outline">{product.productType}</span>
              </div>
            )}


          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-base-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                product.description ||
                product.bodyHtmlText ||
                product.descriptionText ||
                'No description available.',
            }}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-base-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, i) => (
                <div key={i} className="border-b border-base-300 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                                             <div className="flex items-center">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <svg
                             key={star}
                             className={`w-4 h-4 ${
                               star <= review.rating
                                 ? 'text-yellow-400 fill-current'
                                 : 'text-gray-300'
                             }`}
                             viewBox="0 0 24 24"
                           >
                             <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                           </svg>
                         ))}
                       </div>
                      <span className="text-sm text-base-content/70">
                        by {review.userEmail}
                      </span>
                    </div>
                  </div>
                  <p className="text-base-content/90">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/70 italic">No reviews yet. Be the first to review this product!</p>
          )}

          {/* Review Form */}
          {user && (
            <div className="mt-8 p-6 bg-base-200/50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form
                onSubmit={handleSubmit(async (data) => {
                  const res = await apiFetch(`/api/products/${id}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    const response = await res.json();
                    setAverageRating(response.averageRating);
                    setReviewCount(response.reviewCount);
                    const rres = await apiFetch(`/api/products/${id}/reviews`);
                    if (rres.ok) {
                      const rdata = await rres.json();
                      setReviews(rdata.reviews);
                    }
                    reset({ rating: 5, comment: '' });
                  }
                })}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Rating</label>
                  <SelectDropdown
                    name="rating"
                    control={control}
                    options={[1, 2, 3, 4, 5].map((n) => ({
                      label: `${n} Star${n !== 1 ? 's' : ''}`,
                      value: String(n),
                    }))}
                    rules={{ valueAsNumber: true }}
                    className="max-w-xs"
                  />
                </div>
                <Textarea
                  className="w-full"
                  placeholder="Share your experience with this product..."
                  register={register}
                  name="comment"
                />
                <button
                  className="btn btn-primary transition-all duration-200"
                  type="submit"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {product.category && (
          <div className="mt-12">
            <RecommendedProducts
              category={product.category.name}
              excludeId={product.id}
              limit={5}
            />
          </div>
        )}

        {/* Back to Products */}
        <div className="mt-8 text-center">
          <Link 
            href="/products"
            className="btn btn-outline btn-lg transition-all duration-200 hover:scale-105"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}
