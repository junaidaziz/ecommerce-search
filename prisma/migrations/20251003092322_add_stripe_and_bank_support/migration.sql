-- AlterTable
ALTER TABLE "PaymentMethod" 
ADD COLUMN "stripePaymentId" TEXT,
ADD COLUMN "bankName" TEXT,
ADD COLUMN "accountLast4" TEXT,
ADD COLUMN "accountType" TEXT,
ADD COLUMN "routingNumber" TEXT;
