/*
  Warnings:

  - The values [FINISHED] on the enum `GatheringStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GatheringStatus_new" AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'CANCELED', 'COMPLETED');
ALTER TABLE "public"."Gathering" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Gathering" ALTER COLUMN "status" TYPE "GatheringStatus_new" USING ("status"::text::"GatheringStatus_new");
ALTER TYPE "GatheringStatus" RENAME TO "GatheringStatus_old";
ALTER TYPE "GatheringStatus_new" RENAME TO "GatheringStatus";
DROP TYPE "public"."GatheringStatus_old";
ALTER TABLE "Gathering" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ParticipantStatus" ADD VALUE 'YES_SHOW';
ALTER TYPE "ParticipantStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "noShowCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yesShowCount" INTEGER NOT NULL DEFAULT 0;
