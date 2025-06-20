import { prisma } from './prisma';

const cartStore = new Map<string, any[]>();
const wishlistStore = new Map<string, any[]>();
const reviewsStore = new Map<string, any[]>();

export const getDb = () => prisma;
export default prisma;

export async function dbGetCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getProductById(id: string | number) {
  return prisma.product.findUnique({
    where: { id: Number(id) },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export async function decreaseProductQuantity(id: string | number, qty: number) {
  return prisma.product.update({
    where: { id: Number(id) },
    data: { quantity: { decrement: qty } },
  });
}

export function getCart(email: string) {
  return cartStore.get(email) || [];
}

export function setCart(email: string, items: any[]) {
  cartStore.set(email, items);
}

export function clearCart(email: string) {
  cartStore.delete(email);
}

export function getWishlist(email: string) {
  return wishlistStore.get(email) || [];
}

export function setWishlist(email: string, items: any[]) {
  wishlistStore.set(email, items);
}

export function addReview(review: {
  productId: string;
  userEmail: string;
  rating: number;
  comment: string;
}) {
  const list = reviewsStore.get(review.productId) || [];
  list.push({
    ...review,
    createdAt: new Date().toISOString(),
  });
  reviewsStore.set(review.productId, list);
}

export function getReviewsForProduct(productId: string) {
  return reviewsStore.get(productId) || [];
}

export function getAverageRating(productId: string) {
  const reviews = reviewsStore.get(productId) || [];
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
