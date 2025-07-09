/*
  Warnings:

  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `couponUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deletionRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `policyDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `searchLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supportTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "coupon" DROP CONSTRAINT "coupon_userId_fkey";

-- DropForeignKey
ALTER TABLE "couponUsage" DROP CONSTRAINT "couponUsage_couponId_fkey";

-- DropForeignKey
ALTER TABLE "couponUsage" DROP CONSTRAINT "couponUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "deletionRequest" DROP CONSTRAINT "deletionRequest_brandId_fkey";

-- DropForeignKey
ALTER TABLE "deletionRequest" DROP CONSTRAINT "deletionRequest_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_orderId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_orderId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_userId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_variantId_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "paymentMethod" DROP CONSTRAINT "paymentMethod_userId_fkey";

-- DropForeignKey
ALTER TABLE "policyDocument" DROP CONSTRAINT "policyDocument_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "searchLog" DROP CONSTRAINT "searchLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "supportTicket" DROP CONSTRAINT "supportTicket_userId_fkey";

-- DropForeignKey
ALTER TABLE "variant" DROP CONSTRAINT "variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "wishlistItem" DROP CONSTRAINT "wishlistItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "wishlistItem" DROP CONSTRAINT "wishlistItem_userId_fkey";

-- DropTable
DROP TABLE "category";

-- DropTable
DROP TABLE "coupon";

-- DropTable
DROP TABLE "couponUsage";

-- DropTable
DROP TABLE "deletionRequest";

-- DropTable
DROP TABLE "message";

-- DropTable
DROP TABLE "notification";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "paymentMethod";

-- DropTable
DROP TABLE "policyDocument";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "searchLog";

-- DropTable
DROP TABLE "supportTicket";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "variant";

-- DropTable
DROP TABLE "wishlistItem";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "brandName" TEXT,
    "gender" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "businessAddress" TEXT,
    "website" TEXT,
    "businessDescription" TEXT,
    "logo" TEXT,
    "profileImage" TEXT,
    "taxId" TEXT,
    "stripeAccountId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "tags" TEXT[],
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER DEFAULT 5,
    "minPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "images" TEXT[],
    "vendorId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "attributes" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "priceModifier" DOUBLE PRECISION,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentProof" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER,
    "query" TEXT NOT NULL,
    "noResults" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION,
    "expiresAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "cardLast4" TEXT NOT NULL,
    "cardBrand" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyDocument" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" TEXT,
    "notifyOnStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Category_uuid_key" ON "Category"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_uuid_key" ON "Product"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_uuid_key" ON "Variant"("uuid");

-- CreateIndex
CREATE INDEX "Variant_uuid_idx" ON "Variant"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Order_uuid_key" ON "Order"("uuid");

-- CreateIndex
CREATE INDEX "Order_uuid_idx" ON "Order"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "DeletionRequest_uuid_key" ON "DeletionRequest"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "SearchLog_uuid_key" ON "SearchLog"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponId_userId_key" ON "CouponUsage"("couponId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyDocument_type_version_key" ON "PolicyDocument"("type", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_uuid_key" ON "SupportTicket"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_uuid_key" ON "WishlistItem"("uuid");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
