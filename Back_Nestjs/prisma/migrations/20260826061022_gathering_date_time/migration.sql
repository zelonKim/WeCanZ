-- AlterTable
ALTER TABLE "Gathering" ADD COLUMN     "dateTime" TIMESTAMP(3),
ALTER COLUMN "location" DROP NOT NULL;
