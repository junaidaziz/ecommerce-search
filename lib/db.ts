import { prisma } from './prisma';
import type { Product } from '@types/product';
import type { Review } from '@types/review';

const cartStore = new Map<string, (Product & { qty: number })[]>();
const wishlistStore = new Map<string, Product[]>();
const reviewsStore = new Map<string, Review[]>();

export const getDb = () => prisma;

export async function getProductByUuid(uuid: string) {
  return prisma.product.findUnique({ where: { uuid }, include: { variants: true } });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, vendor: true, variants: true },
  });
}

export async function decreaseProductQuantity(uuid: string, qty: number) {
  return prisma.product.update({
    where: { uuid },
    data: { quantity: { decrement: qty } },
  });
}

export function getCart(email: string): (Product & { qty: number })[] {
  return cartStore.get(email) || [];
}

export function setCart(
  email: string,
  items: (Product & { qty: number })[]
): void {
  cartStore.set(email, items);
}

export function clearCart(email: string) {
  cartStore.delete(email);
}

export function getWishlist(email: string): Product[] {
  return wishlistStore.get(email) || [];
}

export function setWishlist(email: string, items: Product[]): void {
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

export function getReviewsForProduct(productId: string): Review[] {
  return reviewsStore.get(productId) || [];
}

export function getAverageRating(productId: string): {
  average: number;
  count: number;
} {
  const reviews = reviewsStore.get(productId) || [];
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
