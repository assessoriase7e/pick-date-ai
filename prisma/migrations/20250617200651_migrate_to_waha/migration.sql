/*
  Warnings:

  - You are about to drop the `evolutioninstance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "evolutioninstance" DROP CONSTRAINT "evolutioninstance_userId_fkey";

-- DropTable
DROP TABLE "evolutioninstance";

-- CreateTable
CREATE TABLE "wahainstance" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "qrCode" TEXT,
    "webhookUrl" TEXT,
    "apiKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'STOPPED',
    "type" TEXT NOT NULL DEFAULT 'attendant',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wahainstance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wahainstance" ADD CONSTRAINT "wahainstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
