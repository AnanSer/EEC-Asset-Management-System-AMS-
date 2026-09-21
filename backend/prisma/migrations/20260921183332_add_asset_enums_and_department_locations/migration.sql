/*
  Warnings:

  - The `priority` column on the `MaintenanceTicket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Asset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('LAPTOP', 'DESKTOP', 'PRINTER', 'SCANNER', 'ROUTER', 'SWITCH', 'PROJECTOR', 'MONITOR', 'SERVER', 'UPS', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
DROP COLUMN "category",
ADD COLUMN     "category" "AssetCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "building" TEXT,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "officeLocation" TEXT;

-- AlterTable
ALTER TABLE "MaintenanceTicket" DROP COLUMN "priority",
ADD COLUMN     "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "Asset_condition_idx" ON "Asset"("condition");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_priority_idx" ON "MaintenanceTicket"("priority");
