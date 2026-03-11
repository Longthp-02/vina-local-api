-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerUserId" TEXT NOT NULL,
    "followingUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerUserId_followingUserId_key" ON "UserFollow"("followerUserId", "followingUserId");

-- CreateIndex
CREATE INDEX "UserFollow_followingUserId_createdAt_idx" ON "UserFollow"("followingUserId", "createdAt");

-- CreateIndex
CREATE INDEX "UserFollow_followerUserId_createdAt_idx" ON "UserFollow"("followerUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingUserId_fkey" FOREIGN KEY ("followingUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
