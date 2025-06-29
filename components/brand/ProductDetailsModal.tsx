import React, { useEffect } from 'react';
import Image from 'next/image';
import { GenericModal, StatusLabel } from '@components/UI';
import type { Product } from '@/types/product';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose }) => {
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
  const imageUrl = product.featuredImage?.url || product.images?.[0]?.url;

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title={product.title || 'Product'}>
      <div className="space-y-4">
        {imageUrl && (
          <div className="relative w-full aspect-square overflow-hidden rounded-box">
            <Image src={imageUrl} alt={product.title || 'Product image'} fill sizes="100vw" className="object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <StatusLabel size="sm" color={product.status === 'approved' ? 'success' : product.status === 'pending' ? 'warning' : 'error'}>
            {product.status}
          </StatusLabel>
          <span className="text-sm">Stock: {product.totalInventory ?? product.quantity ?? 0}</span>
        </div>
        <p className="font-semibold">Price: {price}</p>
        <p>{product.descriptionText || product.bodyHtmlText || product.description || 'No description.'}</p>
        <div className="flex justify-end">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default ProductDetailsModal;
