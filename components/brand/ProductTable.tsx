import React from 'react';
import Link from 'next/link';
import { StatusLabel } from '@components/UI';
import type { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onView, onDelete }) => {
  const getCategory = (p: Product): string =>
    typeof p.category === 'string' ? p.category : p.category?.name || p.productType;

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[80vh] overflow-y-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th className="hidden sm:table-cell">Category</th>
              <th>Status</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="cursor-pointer" onClick={() => onView(p)}>
                <td className="whitespace-nowrap">{p.title}</td>
                <td className="hidden sm:table-cell">{getCategory(p)}</td>
                <td>
                  <StatusLabel
                    color={
                      p.status === 'approved'
                        ? 'success'
                        : p.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                  >
                    {p.status}
                  </StatusLabel>
                </td>
                <td>{p.quantity ?? p.totalInventory ?? 0}</td>
                <td className="space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn btn-xs sm:btn-sm"
                    onClick={() => onView(p)}
                  >
                    View
                  </button>
                  <Link href={`/brand/products/new?edit=${p.uuid || p.id}`} className="btn btn-xs sm:btn-sm">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-xs sm:btn-sm btn-error"
                    onClick={() => onDelete(String(p.uuid || p.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
