/*
  Warnings:

  - You are about to drop the column `status` on the `event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "status";

-- DropEnum
DROP TYPE "EventStatus";
