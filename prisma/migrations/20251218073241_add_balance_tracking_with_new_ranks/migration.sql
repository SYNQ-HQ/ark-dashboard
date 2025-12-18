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
