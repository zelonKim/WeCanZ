/*
  Warnings:

  - The `status` column on the `Gathering` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Participant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `intro` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,socialId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `Gathering` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GatheringCategory" AS ENUM ('DRINK', 'CLUB', 'DRINK_CLUB');

-- CreateEnum
CREATE TYPE "GatheringStatus" AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'APPROVED', 'BANNED');

-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_gatheringId_fkey";

-- AlterTable
ALTER TABLE "Gathering" DROP COLUMN "category",
ADD COLUMN     "category" "GatheringCategory" NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "GatheringStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "status",
ADD COLUMN     "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "joinedAt" DROP NOT NULL,
ALTER COLUMN "joinedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "intro",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "socialId" TEXT;

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "ChatRoom";

-- CreateTable
CREATE TABLE "GatheringChatRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gatheringId" TEXT NOT NULL,

    CONSTRAINT "GatheringChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatheringChatMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "GatheringChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectChatRoom" (
    "id" TEXT NOT NULL,
    "status" "ChatRoomStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,

    CONSTRAINT "DirectChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectChatMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "DirectChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectChatRoom_user1Id_user2Id_key" ON "DirectChatRoom"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_senderId_receiverId_key" ON "Friendship"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_socialId_key" ON "User"("provider", "socialId");

-- AddForeignKey
ALTER TABLE "GatheringChatRoom" ADD CONSTRAINT "GatheringChatRoom_gatheringId_fkey" FOREIGN KEY ("gatheringId") REFERENCES "Gathering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GatheringChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatheringChatMessage" ADD CONSTRAINT "GatheringChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatRoom" ADD CONSTRAINT "DirectChatRoom_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatRoom" ADD CONSTRAINT "DirectChatRoom_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatMessage" ADD CONSTRAINT "DirectChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "DirectChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectChatMessage" ADD CONSTRAINT "DirectChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
