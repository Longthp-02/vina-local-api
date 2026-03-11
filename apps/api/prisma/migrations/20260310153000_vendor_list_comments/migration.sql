-- CreateTable
CREATE TABLE "VendorListComment" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorListComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorListComment_listId_createdAt_idx" ON "VendorListComment"("listId", "createdAt");

-- CreateIndex
CREATE INDEX "VendorListComment_userId_createdAt_idx" ON "VendorListComment"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "VendorListComment" ADD CONSTRAINT "VendorListComment_listId_fkey" FOREIGN KEY ("listId") REFERENCES "VendorList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorListComment" ADD CONSTRAINT "VendorListComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
