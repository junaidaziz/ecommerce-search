import React from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

interface ProductBreadcrumbsProps {
  product: Product;
  className?: string;
}

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({
  product,
  className = '',
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-base-content/70 mb-6 ${className}`}>
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
  );
};

export default ProductBreadcrumbs; 