/*
  Warnings:

  - The `tags` column on the `product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images` column on the `product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `paymentMethods` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[],
DROP COLUMN "images",
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "user" DROP COLUMN "paymentMethods";
