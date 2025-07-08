import React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@components/UI';
import type { Product } from '@/types';
import type { BrandProductSortValue } from './BrandProductSort';

interface ProductTableProps {
  products: Product[];
  sort: BrandProductSortValue;
  onSort: (field: 'title' | 'category' | 'status' | 'quantity') => void;
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, sort, onSort, onView, onDelete }) => {
  const headerClass = (field: string) =>
    'px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer';
  const headerAria = (field: string) => undefined;
  const arrow = (active: boolean, dir: 'asc' | 'desc') =>
    active ? (dir === 'asc' ? '▲' : '▼') : '';
  const getCategory = (p: Product) => p.category?.name || '-';
  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th className={headerClass('title')} aria-sort={headerAria('title')}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-left flex items-center gap-1"
              onClick={() => onSort('title')}
            >
              Product {arrow(sort.startsWith('title_'), sort.endsWith('asc') ? 'asc' : 'desc')}
            </Button>
          </th>
          <th className={`hidden sm:table-cell ${headerClass('category')}`} aria-sort={headerAria('category')}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-left flex items-center gap-1"
              onClick={() => onSort('category')}
            >
              Category {arrow(sort.startsWith('category_'), sort.endsWith('asc') ? 'asc' : 'desc')}
            </Button>
          </th>
          <th className={headerClass('status')} aria-sort={headerAria('status')}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-left flex items-center gap-1"
              onClick={() => onSort('status')}
            >
              Status {arrow(sort.startsWith('status_'), sort.endsWith('asc') ? 'asc' : 'desc')}
            </Button>
          </th>
          <th className={headerClass('quantity')} aria-sort={headerAria('quantity')}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-left flex items-center gap-1"
              onClick={() => onSort('quantity')}
            >
              Qty {arrow(sort.startsWith('quantity_'), sort.endsWith('asc') ? 'asc' : 'desc')}
            </Button>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="cursor-pointer">
            <td className="whitespace-nowrap">{p.title}</td>
            <td className="hidden sm:table-cell">{getCategory(p)}</td>
            <td>
              <Badge
                variant={
                  p.status === 'approved'
                    ? 'success'
                    : p.status === 'pending'
                    ? 'warning'
                    : 'danger'
                }
                pill
              >
                {p.status}
              </Badge>
            </td>
            <td>{p.quantity ?? p.totalInventory ?? 0}</td>
            <td className="space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="info" onClick={() => onView(p)}>
                View
              </Button>
              <Link href={`/brand/products/new?edit=${p.uuid || p.id}`} legacyBehavior>
                <Button size="sm" variant="primary" as="a">
                  Edit
                </Button>
              </Link>
              <Button size="sm" variant="danger" onClick={() => onDelete(String(p.uuid || p.id))}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
