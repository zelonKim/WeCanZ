/*
  Warnings:

  - The `status` column on the `DirectChatRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DirectChatRoomStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "DirectChatRoom" DROP COLUMN "status",
ADD COLUMN     "status" "DirectChatRoomStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "ChatRoomStatus";
