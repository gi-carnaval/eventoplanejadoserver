-- CreateEnum
CREATE TYPE "EventUserStatus" AS ENUM ('ACCEPTED', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED');

-- AlterTable
ALTER TABLE "event_users" ADD COLUMN     "eventUserStatus" "EventUserStatus" NOT NULL DEFAULT 'ACCEPTED';
