-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "goal" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "raised" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "status" TEXT DEFAULT 'active',
ADD COLUMN     "supporters" INTEGER DEFAULT 0;
