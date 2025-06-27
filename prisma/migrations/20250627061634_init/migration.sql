-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'processing';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "lowStockThreshold" INTEGER DEFAULT 5;
