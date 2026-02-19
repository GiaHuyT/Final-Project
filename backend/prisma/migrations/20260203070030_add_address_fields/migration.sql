/*
  Warnings:

  - Added the required column `district` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverPhone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ward` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "receiverName" TEXT NOT NULL,
ADD COLUMN     "receiverPhone" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "ward" TEXT NOT NULL;
