/*
  Warnings:

  - A unique constraint covering the columns `[reporterId,reportedUserId,reason]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_reportedUserId_reason_key" ON "Report"("reporterId", "reportedUserId", "reason");
