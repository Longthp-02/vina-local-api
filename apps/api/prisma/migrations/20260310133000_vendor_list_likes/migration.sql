-- CreateTable
CREATE TABLE "VendorListLike" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorListLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorListLike_listId_userId_key" ON "VendorListLike"("listId", "userId");

-- CreateIndex
CREATE INDEX "VendorListLike_userId_idx" ON "VendorListLike"("userId");

-- CreateIndex
CREATE INDEX "VendorListLike_listId_createdAt_idx" ON "VendorListLike"("listId", "createdAt");

-- AddForeignKey
ALTER TABLE "VendorListLike" ADD CONSTRAINT "VendorListLike_listId_fkey" FOREIGN KEY ("listId") REFERENCES "VendorList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorListLike" ADD CONSTRAINT "VendorListLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
