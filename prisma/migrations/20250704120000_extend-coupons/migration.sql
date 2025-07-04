-- AlterTable
ALTER TABLE "Coupon" RENAME COLUMN "amount" TO "discountValue";
ALTER TABLE "Coupon" RENAME COLUMN "expirationDate" TO "expiresAt";
ALTER TABLE "Coupon" ADD COLUMN "description" TEXT;
ALTER TABLE "Coupon" ADD COLUMN "userId" INTEGER;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
