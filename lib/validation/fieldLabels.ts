// Central map of form field machine names to human-friendly labels
// Used to generate consistent required/error messages like "Title is required".

export const FIELD_LABELS: Record<string, string> = {
  sku: 'SKU',
  title: 'Title',
  productType: 'Product Type',
  minPrice: 'Min Price',
  maxPrice: 'Max Price',
  currency: 'Currency',
  discountValue: 'Discount Value',
  vendor: 'Vendor',
  categoryId: 'Category',
  description: 'Description',
  code: 'Coupon Code',
  discountType: 'Discount Type',
};

export const requiredMessage = (field: string) => {
  const label = FIELD_LABELS[field] || field;
  return `${label} is required`;
};
