import React, { useEffect, useState } from 'react';
import { GenericModal, StatusLabel } from '@components/UI';
import ImageGallery from '@components/Product/ImageGallery';
import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!product) return null;

  const price = formatCurrency(product.minPrice || 0, product.currency);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : [];
  const descriptionHtml =
    product.description ||
    product.bodyHtmlText ||
    product.descriptionText ||
    'No description.';
  const category =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name;

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={product.title || 'Product'}
      actions={
        <div className="flex justify-end">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {images.length > 0 && (
          <ImageGallery images={images} className="w-full" imgClass="rounded-box" />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusLabel
              size="sm"
              color={
                product.status === 'approved'
                  ? 'success'
                  : product.status === 'pending'
                    ? 'warning'
                    : 'error'
              }
            >
              {product.status}
            </StatusLabel>
            <span className="text-sm">
              Stock: {product.totalInventory ?? product.quantity ?? 0}
            </span>
          </div>
          <p className="font-semibold">Price: {price}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Description</h3>
          <p
            className={showAll ? undefined : 'line-clamp-5'}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
          {!showAll && descriptionHtml.length > 200 && (
            <button
              type="button"
              className="btn btn-link btn-xs px-0"
              onClick={() => setShowAll(true)}
            >
              Show More
            </button>
          )}
        </div>
        <div className="border-t pt-2 space-y-1 text-sm">
          <p>
            <span className="font-semibold">SKU:</span> {product.sku || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Vendor:</span>{' '}
            {product.vendor?.brandName || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Category:</span> {category || 'N/A'}
          </p>
        </div>
      </div>
    </GenericModal>
  );
};

export default ProductDetailsModal;
