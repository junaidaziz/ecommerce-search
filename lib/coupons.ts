import { getDb } from './db';
import type { Prisma } from '@prisma/client';

const prisma = getDb();

export function findCouponByCode(code: string) {
  return prisma.coupon.findFirst({ where: { code: code.toUpperCase() } });
}

export function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

export function createCoupon(data: Prisma.CouponCreateInput) {
  return prisma.coupon.create({ data });
}

export function updateCoupon(id: number, data: Prisma.CouponUpdateInput) {
  return prisma.coupon.update({ where: { id }, data });
}

export function incrementUsage(id: number) {
  return prisma.coupon.update({
    where: { id },
    data: { usedCount: { increment: 1 } },
  });
}

export function recordUsage(couponId: number, userId: number) {
  return prisma.couponUsage.create({ data: { couponId, userId } });
}

export function hasUserUsedCoupon(couponId: number, userId: number) {
  return prisma.couponUsage.findUnique({
    where: { couponId_userId: { couponId, userId } },
  });
}
