-- CreateEnum
CREATE TYPE "VendorListVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "VendorList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "VendorListVisibility" NOT NULL DEFAULT 'PRIVATE',
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorList_slug_key" ON "VendorList"("slug");

-- CreateIndex
CREATE INDEX "VendorList_userId_updatedAt_idx" ON "VendorList"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "VendorList_visibility_updatedAt_idx" ON "VendorList"("visibility", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VendorListItem_listId_vendorId_key" ON "VendorListItem"("listId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorListItem_listId_position_key" ON "VendorListItem"("listId", "position");

-- CreateIndex
CREATE INDEX "VendorListItem_vendorId_idx" ON "VendorListItem"("vendorId");

-- CreateIndex
CREATE INDEX "VendorListItem_listId_createdAt_idx" ON "VendorListItem"("listId", "createdAt");

-- AddForeignKey
ALTER TABLE "VendorList" ADD CONSTRAINT "VendorList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorListItem" ADD CONSTRAINT "VendorListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "VendorList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorListItem" ADD CONSTRAINT "VendorListItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
