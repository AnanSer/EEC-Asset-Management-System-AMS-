-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'NEEDS_REPAIR');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "headOfDepartment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "jobTitle" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "officeLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "departmentId" TEXT,
    "location" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(12,2),
    "warrantyExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedDate" TIMESTAMP(3),
    "conditionOnAssign" TEXT,
    "conditionOnReturn" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "cost" DECIMAL(10,2),
    "startDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "reportedBy" TEXT,
    "assignedTechnician" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionTest" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "testedBy" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "findings" TEXT,
    "recommendations" TEXT,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeId_key" ON "EmployeeProfile"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_employeeId_idx" ON "EmployeeProfile"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_departmentId_idx" ON "EmployeeProfile"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_assetCode_idx" ON "Asset"("assetCode");

-- CreateIndex
CREATE INDEX "Asset_serialNumber_idx" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_departmentId_idx" ON "Asset"("departmentId");

-- CreateIndex
CREATE INDEX "AssetAssignment_assetId_idx" ON "AssetAssignment"("assetId");

-- CreateIndex
CREATE INDEX "AssetAssignment_employeeId_idx" ON "AssetAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "AssetAssignment_isCurrent_idx" ON "AssetAssignment"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTicket_ticketNumber_key" ON "MaintenanceTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_ticketNumber_idx" ON "MaintenanceTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_assetId_idx" ON "MaintenanceTicket"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_status_idx" ON "MaintenanceTicket"("status");

-- CreateIndex
CREATE INDEX "InspectionTest_ticketId_idx" ON "InspectionTest"("ticketId");

-- CreateIndex
CREATE INDEX "InspectionTest_status_idx" ON "InspectionTest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionTest" ADD CONSTRAINT "InspectionTest_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
