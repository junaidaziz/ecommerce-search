import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ProductErrorProps {
  type: 'not-found' | 'api-error';
  message?: string;
  showBackButton?: boolean;
}

/**
 * Reusable error component for product pages
 * Displays styled error messages for 404 and API errors
 */
const ProductError: React.FC<ProductErrorProps> = ({ 
  type, 
  message,
  showBackButton = true,
}) => {
  const router = useRouter();

  const is404 = type === 'not-found';
  const defaultMessage = is404 
    ? 'The product you are looking for could not be found.' 
    : 'We encountered an error loading this product. Please try again later.';

  const title = is404 ? 'Product Not Found' : 'Error Loading Product';
  const displayMessage = message || defaultMessage;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          {is404 ? (
            <svg 
              className="mx-auto h-24 w-24 text-base-content/20"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          ) : (
            <svg 
              className="mx-auto h-24 w-24 text-error/70"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-base-content mb-3">
          {title}
        </h1>

        {/* Message */}
        <p className="text-base-content/70 mb-8 text-lg">
          {displayMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Go Back
            </button>
          )}
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>

        {/* Additional Help for API Errors */}
        {!is404 && (
          <div className="mt-8 p-4 bg-base-200 rounded-lg text-sm text-base-content/60">
            <p>
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductError;
