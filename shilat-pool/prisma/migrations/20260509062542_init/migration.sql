-- CreateTable
CREATE TABLE "MembershipType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameHe" TEXT NOT NULL,
    "descriptionHe" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "earlyAccessPrice" INTEGER NOT NULL,
    "maxAdults" INTEGER NOT NULL DEFAULT 1,
    "maxChildren" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "confirmationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "israeliId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "membershipTypeId" TEXT NOT NULL,
    "priceCharged" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "mockTransactionId" TEXT,
    "isEarlyAccess" BOOLEAN NOT NULL DEFAULT false,
    "earlyAccessWindowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_membershipTypeId_fkey" FOREIGN KEY ("membershipTypeId") REFERENCES "MembershipType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_earlyAccessWindowId_fkey" FOREIGN KEY ("earlyAccessWindowId") REFERENCES "EarlyAccessWindow" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    CONSTRAINT "FamilyMember_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EarlyAccessWindow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "opensAt" DATETIME NOT NULL,
    "closesAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PastMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "israeliIdHmac" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipType_slug_key" ON "MembershipType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_confirmationNumber_key" ON "Registration"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Registration_israeliId_idx" ON "Registration"("israeliId");

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PastMember_israeliIdHmac_key" ON "PastMember"("israeliIdHmac");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
