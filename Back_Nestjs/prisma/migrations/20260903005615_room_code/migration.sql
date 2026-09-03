/*
  Warnings:

  - A unique constraint covering the columns `[roomCode]` on the table `Gathering` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Gathering" ADD COLUMN     "roomCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Gathering_roomCode_key" ON "Gathering"("roomCode");
