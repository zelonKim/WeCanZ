-- DropForeignKey
ALTER TABLE "DirectChatMessage" DROP CONSTRAINT "DirectChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "DirectChatRoom" DROP CONSTRAINT "DirectChatRoom_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "DirectChatRoom" DROP CONSTRAINT "DirectChatRoom_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "Gathering" DROP CONSTRAINT "Gathering_hostId_fkey";

-- DropForeignKey
ALTER TABLE "GatheringChatMessage" DROP CONSTRAINT "GatheringChatMessage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "GatheringChatRoom" DROP CONSTRAINT "GatheringChatRoom_gatheringId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_gatheringId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reportedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropIndex
DROP INDEX "Report_reporterId_reportedUserId_key";

-- AlterTable
ALTER TABLE "DirectChatMessage" ALTER COLUMN "senderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DirectChatRoom" ALTER COLUMN "user1Id" DROP NOT NULL,
ALTER COLUMN "user2Id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "reporterId" DROP NOT NULL,
ALTER COLUMN "reportedUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Gathering" ADD CONSTRAINT "Gathering_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_gatheringId_fkey" FOREIGN KEY ("gatheringId") REFERENCES "Gathering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatheringChatRoom" ADD CONSTRAINT "GatheringChatRoom_gatheringId_fkey" FOREIGN KEY ("gatheringId") REFERENCES "Gathering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GatheringChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatRoom" ADD CONSTRAINT "DirectChatRoom_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatRoom" ADD CONSTRAINT "DirectChatRoom_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatMessage" ADD CONSTRAINT "DirectChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
