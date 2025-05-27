/*
  Warnings:

  - You are about to drop the column `workingHours` on the `collaborator` table. All the data in the column will be lost.
  - Made the column `accessCode` on table `calendar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "calendar" ALTER COLUMN "accessCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "collaborator" DROP COLUMN "workingHours";

-- CreateTable
CREATE TABLE "workhour" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "collaboratorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workhour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workhour" ADD CONSTRAINT "workhour_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
