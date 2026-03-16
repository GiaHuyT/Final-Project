/*
  Warnings:

  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_profileId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "avgFuelConsumption" DOUBLE PRECISION,
ADD COLUMN     "bodyType" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" TEXT DEFAULT 'Xe mới',
ADD COLUMN     "driveType" TEXT,
ADD COLUMN     "engineCapacity" TEXT,
ADD COLUMN     "fuelTankCapacity" DOUBLE PRECISION,
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "groundClearance" DOUBLE PRECISION,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "maxPower" TEXT,
ADD COLUMN     "maxTorque" TEXT,
ADD COLUMN     "mileage" DOUBLE PRECISION,
ADD COLUMN     "modelName" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "version" TEXT,
ADD COLUMN     "wheelbase" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION,
ADD COLUMN     "year" INTEGER;

-- DropTable
DROP TABLE "Vehicle";

-- CreateTable
CREATE TABLE "RentalCar" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Unknown',
    "plate" TEXT NOT NULL DEFAULT 'Unknown',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Sẵn sàng',
    "imageUrl" TEXT,

    CONSTRAINT "RentalCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairService" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Hoạt động',

    CONSTRAINT "RepairService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalCar" ADD CONSTRAINT "RentalCar_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ServiceProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairService" ADD CONSTRAINT "RepairService_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ServiceProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
