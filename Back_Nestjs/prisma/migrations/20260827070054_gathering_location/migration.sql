/*
  Warnings:

  - Made the column `location` on table `Gathering` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateTime` on table `Gathering` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Gathering" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "dateTime" SET NOT NULL;
