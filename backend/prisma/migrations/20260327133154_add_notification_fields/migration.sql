/*
  Warnings:

  - You are about to drop the `ProductColorImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'AUCTION', 'SYSTEM', 'PROMOTION');

-- DropForeignKey
ALTER TABLE "ProductColorImage" DROP CONSTRAINT "ProductColorImage_productId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- DropTable
DROP TABLE "ProductColorImage";

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColorVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "ProductColorVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantImage" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColorVariant" ADD CONSTRAINT "ProductColorVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantImage" ADD CONSTRAINT "ProductVariantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductColorVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
