/*
  Warnings:

  - Added the required column `currentPeriodEnd` to the `additionalCalendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `additionalCalendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "additionalCalendar" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
