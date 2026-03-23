/*
  Warnings:

  - You are about to drop the column `version` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "version",
ADD COLUMN     "abs" BOOLEAN DEFAULT false,
ADD COLUMN     "airbags" INTEGER DEFAULT 0,
ADD COLUMN     "appleCarplay" BOOLEAN DEFAULT false,
ADD COLUMN     "autoConditioning" BOOLEAN DEFAULT false,
ADD COLUMN     "ba" BOOLEAN DEFAULT false,
ADD COLUMN     "camera360" BOOLEAN DEFAULT false,
ADD COLUMN     "conditionDetail" TEXT,
ADD COLUMN     "curbWeight" DOUBLE PRECISION,
ADD COLUMN     "electricSeats" BOOLEAN DEFAULT false,
ADD COLUMN     "esp" BOOLEAN DEFAULT false,
ADD COLUMN     "infotainment" BOOLEAN DEFAULT false,
ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "rearSensor" BOOLEAN DEFAULT false,
ADD COLUMN     "variant" TEXT;

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarVariant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "CarVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColorImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ProductColorImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_name_brandId_key" ON "CarModel"("name", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "CarVariant_name_modelId_key" ON "CarVariant"("name", "modelId");

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarVariant" ADD CONSTRAINT "CarVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColorImage" ADD CONSTRAINT "ProductColorImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
