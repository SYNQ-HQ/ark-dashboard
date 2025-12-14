/*
  Warnings:

  - You are about to drop the column `date` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `goal` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `raised` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `supporters` on the `Mission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "date",
DROP COLUMN "goal",
DROP COLUMN "location",
DROP COLUMN "raised",
DROP COLUMN "status",
DROP COLUMN "supporters";
