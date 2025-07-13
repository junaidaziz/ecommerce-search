import { apiFetch } from '@lib/api';
import { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { AppContext } from '@contexts/AppContext';
import ProductImageSlider from '@components/Product/ProductImageSlider';
import RecommendedProducts from '@components/Product/RecommendedProducts';
import HeartIcon from '@components/icons/HeartIcon';
import {
  getProductBySlug,
  getReviewsForProduct,
  getAverageRating,
} from '@lib/db';
import { mapDbRowToProduct } from '@lib/products';
import { Product, Review } from '@/types';
import { serializeDates } from '@utils/serializeDates';
import ChevronLeftIcon from '@components/icons/ChevronLeftIcon';
import {
  ProductBreadcrumbs,
  ProductHeader,
  ProductPriceStock,
  ProductVariants,
  ProductCartActions,
  ProductDescription,
  ProductReviews,
} from '@components/Product/ProductDetail';

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
        <ProductBreadcrumbs product={product} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Product Images */}
          <div className="bg-base-100 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center">
            <ProductImageSlider
              className="w-full aspect-[4/3] max-w-lg"
              images={
                product.images && product.images.length > 0
                  ? product.images
                  : product.featuredImage
                  ? [product.featuredImage]
                  : []
              }
              imgClass="object-cover rounded-xl border border-base-300 bg-white dark:bg-gray-900"
              aspectRatioClass="aspect-[4/3]"
            />
          </div>

          {/* Product Information */}
          <div className="relative bg-base-100 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
            {/* Wishlist Icon */}
            <button
              onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
              className={`absolute top-6 right-6 z-10 btn btn-circle btn-sm transition-all duration-200 border border-base-300 ${
                isInWishlist 
                  ? 'bg-primary text-primary-content hover:bg-primary/80' 
                  : 'bg-base-100 hover:bg-primary hover:text-primary-content'
              }`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HeartIcon className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Product Header */}
            <ProductHeader
              product={product}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />

            {/* Price and Stock */}
            <ProductPriceStock product={product} />

            {/* Variants */}
            <ProductVariants
              variants={product.variants}
              selectedVariantId={variantId}
              onVariantChange={setVariantId}
            />

            {/* Cart Actions */}
            <ProductCartActions
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onChangeQty={changeQty}
              isInCart={isProductInCart}
              cartItemQuantity={cartItemQuantity}
              stockStatus={stockStatus}
            />

            {/* Product Type */}
            {product.productType && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base-content/70">Type:</span>
                <span className="badge badge-outline">{product.productType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <ProductDescription
          description={product.description}
          bodyHtmlText={product.bodyHtmlText}
          descriptionText={product.descriptionText}
          className="mt-12"
        />

        {/* Reviews Section */}
        <ProductReviews
          productId={String(product.id)}
          reviews={reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
          user={user}
          onReviewsUpdate={(newReviews, newAverage, newCount) => {
            setReviews(newReviews);
            setAverageRating(newAverage);
            setReviewCount(newCount);
          }}
          className="mt-12"
        />

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
