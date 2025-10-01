/**
 * Utility functions for handling product images
 */

/**
 * Generate a placeholder image URL for a product
 * Uses Unsplash for high-quality random product images
 * @param productId - Product identifier for consistent image selection
 * @param category - Optional category to get category-specific images
 * @returns URL to a placeholder image
 */
export function getProductPlaceholderImage(
  productId: string | number,
  category?: string
): string {
  // Use product ID as seed for consistent images
  const seed = typeof productId === 'string' ? productId : productId.toString();
  
  // Map common categories to Unsplash collections or queries
  const categoryMap: Record<string, string> = {
    electronics: 'technology,gadgets',
    fashion: 'fashion,clothing',
    clothing: 'fashion,clothing',
    shoes: 'shoes,footwear',
    accessories: 'accessories,jewelry',
    beauty: 'beauty,cosmetics',
    home: 'home,interior',
    furniture: 'furniture,interior',
    sports: 'sports,fitness',
    books: 'books,reading',
    toys: 'toys,kids',
    food: 'food,cooking',
    jewelry: 'jewelry,accessories',
    watches: 'watches,luxury',
  };

  // Get category query or default to 'product'
  const categoryQuery = category 
    ? categoryMap[category.toLowerCase()] || 'product,shopping'
    : 'product,shopping';

  // Use Unsplash source API with specific dimensions and query
  return `https://source.unsplash.com/400x400/?${categoryQuery}&sig=${seed}`;
}

/**
 * Parse product images from various formats
 * @param images - Images in various formats (string, array of strings, array of objects)
 * @returns Array of image objects with url and optional alt text
 */
export function parseProductImages(
  images: unknown,
  productId?: string | number,
  category?: string
): { url: string; alt?: string }[] {
  let imagesArr: { url: string; alt?: string }[] = [];

  if (Array.isArray(images) && images.length > 0) {
    imagesArr = images
      .map((img: unknown) => {
        if (typeof img === 'string' && /^(\/|https?:\/\/)/.test(img.trim())) {
          return { url: img.trim() };
        } else if (
          img &&
          typeof img === 'object' &&
          'url' in img &&
          typeof (img as { url?: string }).url === 'string' &&
          /^(\/|https?:\/\/)/.test((img as { url: string }).url.trim())
        ) {
          return {
            url: (img as { url: string }).url.trim(),
            alt: 'alt' in img && typeof (img as { alt?: string }).alt === 'string' 
              ? (img as { alt: string }).alt 
              : undefined,
          };
        }
        return null;
      })
      .filter((img): img is { url: string; alt?: string } => img !== null);
  }

  // If no valid images and productId is provided, use placeholder
  if (imagesArr.length === 0 && productId) {
    imagesArr = [{ 
      url: getProductPlaceholderImage(productId, category),
      alt: 'Product image' 
    }];
  } else if (imagesArr.length === 0) {
    // Fallback to local placeholder
    imagesArr = [{ url: '/placeholder.png', alt: 'No image available' }];
  }

  return imagesArr;
}
