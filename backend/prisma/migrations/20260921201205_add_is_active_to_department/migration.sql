-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Department_isActive_idx" ON "Department"("isActive");
