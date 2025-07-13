import React from 'react';

interface ProductVariant {
  id: string | number;
  attributes: Record<string, string>;
  quantity: number;
}

interface ProductVariantsProps {
  variants?: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  className?: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  className = '',
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-base-content">
        Select Variant
      </label>
      <select
        className="select select-bordered w-full"
        value={selectedVariantId}
        onChange={(e) => onVariantChange(e.target.value)}
      >
        <option value="">Choose an option</option>
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {Object.entries(v.attributes)
              .map(([k, val]) => `${k}: ${val}`)
              .join(', ')} - Stock {v.quantity}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductVariants; 