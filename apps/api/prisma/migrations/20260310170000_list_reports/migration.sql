ALTER TABLE "VendorList"
ADD COLUMN "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reportedAt" TIMESTAMP(3),
ADD COLUMN "hiddenAt" TIMESTAMP(3);

CREATE TABLE "VendorListReport" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorListReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VendorListReport_listId_userId_key" ON "VendorListReport"("listId", "userId");
CREATE INDEX "VendorList_reportedAt_idx" ON "VendorList"("reportedAt");
CREATE INDEX "VendorList_hiddenAt_idx" ON "VendorList"("hiddenAt");
CREATE INDEX "VendorListReport_listId_createdAt_idx" ON "VendorListReport"("listId", "createdAt");
CREATE INDEX "VendorListReport_userId_createdAt_idx" ON "VendorListReport"("userId", "createdAt");

ALTER TABLE "VendorListReport" ADD CONSTRAINT "VendorListReport_listId_fkey" FOREIGN KEY ("listId") REFERENCES "VendorList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorListReport" ADD CONSTRAINT "VendorListReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
