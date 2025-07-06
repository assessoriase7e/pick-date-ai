/*
  Warnings:

  - Added the required column `planType` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "planType" TEXT NOT NULL;
