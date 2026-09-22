-- AlterEnum for AccountStatus
BEGIN;
CREATE TYPE "AccountStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "AccountStatus_new" USING (
  CASE
    WHEN "status"::text = 'ACTIVE' THEN 'APPROVED'::"AccountStatus_new"
    WHEN "status"::text = 'INACTIVE' THEN 'SUSPENDED'::"AccountStatus_new"
    WHEN "status"::text = 'PENDING_VERIFICATION' THEN 'PENDING'::"AccountStatus_new"
    ELSE 'PENDING'::"AccountStatus_new"
  END
);
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
ALTER TYPE "AccountStatus_new" RENAME TO "AccountStatus";
DROP TYPE "public"."AccountStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum for UserRole
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'IT_TECHNICIAN', 'DEPARTMENT_MANAGER', 'EMPLOYEE');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE 
    WHEN "role"::text = 'SUPER_ADMIN' THEN 'ADMIN'::"UserRole_new"
    WHEN "role"::text = 'MANAGER' THEN 'DEPARTMENT_MANAGER'::"UserRole_new"
    WHEN "role"::text = 'VIEWER' THEN 'EMPLOYEE'::"UserRole_new"
    ELSE "role"::text::"UserRole_new"
  END
);
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- AlterTable EmployeeProfile
ALTER TABLE "EmployeeProfile" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable User
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "EmployeeProfile_isActive_idx" ON "EmployeeProfile"("isActive");
