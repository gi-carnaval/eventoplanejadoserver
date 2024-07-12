/*
  Warnings:

  - You are about to drop the `EventInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_userId_fkey";

-- DropTable
DROP TABLE "EventInvitation";

-- CreateTable
CREATE TABLE "event_invitation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EventInvitationStatus" NOT NULL,

    CONSTRAINT "event_invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_invitation" ADD CONSTRAINT "event_invitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitation" ADD CONSTRAINT "event_invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
