-- AlterTable
ALTER TABLE "CarbonTransaction" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "ingestSource" TEXT NOT NULL DEFAULT 'MANUAL';
