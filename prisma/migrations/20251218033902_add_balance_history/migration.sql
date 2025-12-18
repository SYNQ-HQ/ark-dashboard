/*
  Warnings:

  - The values [SENTINEL,OPERATIVE] on the enum `ArkRank` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ArkRank_new" AS ENUM ('RECRUIT', 'SOLDIER', 'ELITE', 'COMMANDER', 'LEGEND', 'VANGUARD', 'CAPTAIN', 'HIGH_GUARDIAN');
ALTER TABLE "User" ALTER COLUMN "arkRank" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "arkRank" TYPE "ArkRank_new" USING ("arkRank"::text::"ArkRank_new");
ALTER TABLE "RankHistory" ALTER COLUMN "rank" TYPE "ArkRank_new" USING ("rank"::text::"ArkRank_new");
ALTER TYPE "ArkRank" RENAME TO "ArkRank_old";
ALTER TYPE "ArkRank_new" RENAME TO "ArkRank";
DROP TYPE "ArkRank_old";
ALTER TABLE "User" ALTER COLUMN "arkRank" SET DEFAULT 'RECRUIT';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastBalanceCheck" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BalanceSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "balanceUsd" DOUBLE PRECISION NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "BalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BalanceSnapshot_userId_checkedAt_idx" ON "BalanceSnapshot"("userId", "checkedAt");

-- CreateIndex
CREATE INDEX "BalanceSnapshot_checkedAt_idx" ON "BalanceSnapshot"("checkedAt");

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
