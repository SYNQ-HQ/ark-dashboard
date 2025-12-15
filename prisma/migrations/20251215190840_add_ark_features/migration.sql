-- CreateEnum
CREATE TYPE "ArkRank" AS ENUM ('RECRUIT', 'SENTINEL', 'OPERATIVE', 'VANGUARD', 'CAPTAIN', 'COMMANDER', 'HIGH_GUARDIAN');

-- AlterTable
ALTER TABLE "Streak" ADD COLUMN     "lastFrozenAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "arkRank" "ArkRank" NOT NULL DEFAULT 'RECRUIT',
ADD COLUMN     "oathAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "oathDurationSeconds" INTEGER,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "CheckInLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "CheckInLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" "ArkRank" NOT NULL,
    "promotedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckInLog" ADD CONSTRAINT "CheckInLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankHistory" ADD CONSTRAINT "RankHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
