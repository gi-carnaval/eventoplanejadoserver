/*
  Warnings:

  - You are about to drop the column `date` on the `event` table. All the data in the column will be lost.
  - Added the required column `status` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'CLOSED');

-- AlterTable
ALTER TABLE "event" DROP COLUMN "date",
ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "startDateTime" TIMESTAMP(3),
ADD COLUMN     "status" "EventStatus" NOT NULL;
