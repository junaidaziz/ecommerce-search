import { prisma } from './prisma';
import type { WishlistItem } from '../types/wishlist';

export async function addWishlistItem(params: {
  userId: number;
  productId: number;
  variantId?: string | null;
  notifyOnStock?: boolean;
}): Promise<WishlistItem> {
  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId: params.userId,
      productId: params.productId,
      variantId: params.variantId ?? null,
    },
    include: { product: { include: { vendor: true, category: true } } },
  });
  if (existing) {
    return prisma.wishlistItem.update({
      where: { id: existing.id },
      data: { notifyOnStock: params.notifyOnStock ?? existing.notifyOnStock },
      include: { product: { include: { vendor: true, category: true } } },
    });
  }
  return prisma.wishlistItem.create({
    data: {
      user: { connect: { id: params.userId } },
      product: { connect: { id: params.productId } },
      variantId: params.variantId,
      notifyOnStock: params.notifyOnStock ?? false,
    },
    include: { product: { include: { vendor: true, category: true } } },
  });
}

export function getWishlistForUser(userId: number): Promise<WishlistItem[]> {
  return prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { product: { include: { vendor: true, category: true } } },
  });
}

export function removeWishlistItem(id: number, userId: number): Promise<void> {
  return prisma.wishlistItem
    .deleteMany({ where: { id, userId } })
    .then(() => {});
}

export async function getStockWatchers(productId: number): Promise<WishlistItem[]> {
  return prisma.wishlistItem.findMany({
    where: { productId, notifyOnStock: true },
    include: { user: true, product: true },
  });
}

export async function disableNotify(id: number): Promise<void> {
  await prisma.wishlistItem.update({
    where: { id },
    data: { notifyOnStock: false },
  });
}

export async function notifyBackInStock(productId: number): Promise<void> {
  const watchers = await getStockWatchers(productId);
  for (const item of watchers) {
    if (!item.user?.email) continue;
    try {
      await import('./email').then(({ sendBackInStock }) =>
        sendBackInStock(item.user.email, item.product.title)
      );
    } catch {
      // ignore email errors
    }
    await disableNotify(item.id);
  }
}
