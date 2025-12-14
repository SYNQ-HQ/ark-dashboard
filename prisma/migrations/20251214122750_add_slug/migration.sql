/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ImpactStory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ImpactStory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImpactStory" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "goal" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "raised" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" TEXT DEFAULT 'active',
ADD COLUMN     "supporters" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "holdingStartedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ImpactStory_slug_key" ON "ImpactStory"("slug");
