-- DropForeignKey
ALTER TABLE "GatheringChatMessage" DROP CONSTRAINT "GatheringChatMessage_senderId_fkey";

-- AlterTable
ALTER TABLE "GatheringChatMessage" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
