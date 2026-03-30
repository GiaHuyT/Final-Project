-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingRequestType" TEXT,
ADD COLUMN     "vendorRequestPending" BOOLEAN NOT NULL DEFAULT false;
