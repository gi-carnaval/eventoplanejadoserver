/*
  Warnings:

  - Made the column `description` on table `event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDateTime` on table `event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDateTime` on table `event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "event" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "endDateTime" SET NOT NULL,
ALTER COLUMN "startDateTime" SET NOT NULL;
