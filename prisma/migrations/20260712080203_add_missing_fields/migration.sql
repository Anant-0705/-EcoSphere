/*
  Warnings:

  - Added the required column `ackDeadline` to the `ESGPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AckStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'OVERDUE');

-- AlterTable
ALTER TABLE "DepartmentScore" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "trend" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ESGPolicy" ADD COLUMN     "ackDeadline" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PolicyAcknowledgement" ADD COLUMN     "status" "AckStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "acknowledgedAt" DROP NOT NULL,
ALTER COLUMN "acknowledgedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "EnvironmentalGoal" ADD CONSTRAINT "EnvironmentalGoal_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
