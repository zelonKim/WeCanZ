-- DropForeignKey
ALTER TABLE "GatheringChatMessage" DROP CONSTRAINT "GatheringChatMessage_senderId_fkey";

-- AlterTable
ALTER TABLE "GatheringChatMessage" ALTER COLUMN "senderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
