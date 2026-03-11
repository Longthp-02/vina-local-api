ALTER TABLE "VendorListComment"
ADD COLUMN "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reportedAt" TIMESTAMP(3),
ADD COLUMN "hiddenAt" TIMESTAMP(3);

CREATE TABLE "VendorListCommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorListCommentReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VendorListCommentReport_commentId_userId_key" ON "VendorListCommentReport"("commentId", "userId");
CREATE INDEX "VendorListComment_reportedAt_idx" ON "VendorListComment"("reportedAt");
CREATE INDEX "VendorListComment_hiddenAt_idx" ON "VendorListComment"("hiddenAt");
CREATE INDEX "VendorListCommentReport_commentId_createdAt_idx" ON "VendorListCommentReport"("commentId", "createdAt");
CREATE INDEX "VendorListCommentReport_userId_createdAt_idx" ON "VendorListCommentReport"("userId", "createdAt");

ALTER TABLE "VendorListCommentReport" ADD CONSTRAINT "VendorListCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "VendorListComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorListCommentReport" ADD CONSTRAINT "VendorListCommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
