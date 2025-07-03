import React from 'react';
import Link from 'next/link';
import { StatusLabel } from '@components/UI';
import type { Product } from '@/types';
import type { BrandProductSortValue } from './BrandProductSort';

interface ProductTableProps {
  products: Product[];
  sort: BrandProductSortValue;
  onSort: (field: 'title' | 'category' | 'status' | 'quantity') => void;
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sort,
  onSort,
  onView,
  onDelete,
}) => {
  const getCategory = (p: Product): string =>
    typeof p.category === 'string'
      ? p.category
      : p.category?.name || p.productType;

  const arrow = (active: boolean, dir: 'asc' | 'desc') => (
    <span className={`${active ? '' : 'invisible'}`}>{dir === 'asc' ? '▲' : '▼'}</span>
  );

  const headerClass = (field: string) =>
    sort.startsWith(`${field}_`) ? 'bg-base-200 text-primary font-semibold' : '';

  const headerAria = (field: string) => {
    if (!sort.startsWith(`${field}_`)) return 'none';
    return sort.endsWith('asc') ? 'ascending' : 'descending';
  };

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className={headerClass('title')} aria-sort={headerAria('title')}>
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-1 cursor-pointer select-none"
                  onClick={() => onSort('title')}
                >
                  Product {arrow(sort.startsWith('title_'), sort.endsWith('asc') ? 'asc' : 'desc')}
                </button>
              </th>
              <th
                className={`hidden sm:table-cell ${headerClass('category')}`}
                aria-sort={headerAria('category')}
              >
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-1 cursor-pointer select-none"
                  onClick={() => onSort('category')}
                >
                  Category {arrow(sort.startsWith('category_'), sort.endsWith('asc') ? 'asc' : 'desc')}
                </button>
              </th>
              <th className={headerClass('status')} aria-sort={headerAria('status')}>
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-1 cursor-pointer select-none"
                  onClick={() => onSort('status')}
                >
                  Status {arrow(sort.startsWith('status_'), sort.endsWith('asc') ? 'asc' : 'desc')}
                </button>
              </th>
              <th className={headerClass('quantity')} aria-sort={headerAria('quantity')}>
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-1 cursor-pointer select-none"
                  onClick={() => onSort('quantity')}
                >
                  Qty {arrow(sort.startsWith('quantity_'), sort.endsWith('asc') ? 'asc' : 'desc')}
                </button>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer"
                onClick={() => onView(p)}
              >
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
                <td
                  className="space-x-2 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn-xs sm:btn-sm"
                    onClick={() => onView(p)}
                  >
                    View
                  </button>
                  <Link
                    href={`/brand/products/new?edit=${p.uuid || p.id}`}
                    className="btn btn-xs sm:btn-sm"
                  >
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
