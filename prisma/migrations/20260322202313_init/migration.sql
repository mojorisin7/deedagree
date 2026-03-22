-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SOLICITOR', 'BROKER', 'VIEWER');

-- CreateEnum
CREATE TYPE "DeedStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURES', 'PARTIALLY_SIGNED', 'FULLY_SIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'INVITED', 'SIGNED', 'DECLINED');

-- CreateEnum
CREATE TYPE "GuaranteeType" AS ENUM ('ALL_MONIES', 'LIMITED', 'SPECIFIC');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('LAW_FIRM', 'BROKERAGE', 'LENDER', 'OTHER');

-- CreateEnum
CREATE TYPE "GoverningLaw" AS ENUM ('ENGLAND_WALES', 'SCOTLAND', 'NORTHERN_IRELAND');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL DEFAULT 'OTHER',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Deed" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "DeedStatus" NOT NULL DEFAULT 'DRAFT',
    "companyName" TEXT NOT NULL,
    "companyRegNumber" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyIncDate" TIMESTAMP(3),
    "directorName" TEXT,
    "directorEmail" TEXT,
    "propertyAddress" TEXT NOT NULL,
    "titleNumber" TEXT,
    "mortgageAmount" INTEGER NOT NULL,
    "lender" TEXT NOT NULL,
    "lenderAddress" TEXT,
    "mortgageRef" TEXT,
    "mortgageStartDate" TIMESTAMP(3),
    "mortgageTermYears" INTEGER,
    "guaranteeType" "GuaranteeType" NOT NULL DEFAULT 'ALL_MONIES',
    "limitedAmount" INTEGER,
    "governingLaw" "GoverningLaw" NOT NULL DEFAULT 'ENGLAND_WALES',
    "executionDate" TIMESTAMP(3),
    "specialConditions" TEXT,
    "jointAndSeveral" BOOLEAN NOT NULL DEFAULT true,
    "includesInterest" BOOLEAN NOT NULL DEFAULT true,
    "includesCosts" BOOLEAN NOT NULL DEFAULT true,
    "requiresILA" BOOLEAN NOT NULL DEFAULT true,
    "organisationId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Deed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guarantor" (
    "id" TEXT NOT NULL,
    "deedId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "relationshipToCompany" TEXT,
    "maxIndividualLiability" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "signatureStatus" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedIpAddress" TEXT,
    "signedUserAgent" TEXT,
    "witnessName" TEXT,
    "witnessAddress" TEXT,
    "witnessSignature" TEXT,
    "witnessSignedAt" TIMESTAMP(3),
    "ilaConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "termsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "voluntaryConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "liabilityConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "inviteToken" TEXT,
    "inviteSentAt" TIMESTAMP(3),
    "inviteExpiresAt" TIMESTAMP(3),
    "lastReminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "deedId" TEXT,
    "userId" TEXT,
    "guarantorId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "deedId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Deed_reference_key" ON "Deed"("reference");

-- CreateIndex
CREATE INDEX "Deed_status_idx" ON "Deed"("status");

-- CreateIndex
CREATE INDEX "Deed_organisationId_idx" ON "Deed"("organisationId");

-- CreateIndex
CREATE INDEX "Deed_createdById_idx" ON "Deed"("createdById");

-- CreateIndex
CREATE INDEX "Deed_createdAt_idx" ON "Deed"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Guarantor_inviteToken_key" ON "Guarantor"("inviteToken");

-- CreateIndex
CREATE INDEX "Guarantor_deedId_idx" ON "Guarantor"("deedId");

-- CreateIndex
CREATE INDEX "Guarantor_email_idx" ON "Guarantor"("email");

-- CreateIndex
CREATE INDEX "Guarantor_inviteToken_idx" ON "Guarantor"("inviteToken");

-- CreateIndex
CREATE INDEX "AuditLog_deedId_idx" ON "AuditLog"("deedId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "Document_deedId_idx" ON "Document"("deedId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deed" ADD CONSTRAINT "Deed_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deed" ADD CONSTRAINT "Deed_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_deedId_fkey" FOREIGN KEY ("deedId") REFERENCES "Deed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_deedId_fkey" FOREIGN KEY ("deedId") REFERENCES "Deed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "Guarantor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_deedId_fkey" FOREIGN KEY ("deedId") REFERENCES "Deed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
