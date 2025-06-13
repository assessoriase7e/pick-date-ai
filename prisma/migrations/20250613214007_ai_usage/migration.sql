-- CreateTable
CREATE TABLE "aiusage" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientPhone" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "responseTime" INTEGER,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aiusage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aiusage_conversationId_key" ON "aiusage"("conversationId");

-- CreateIndex
CREATE INDEX "aiusage_userId_date_idx" ON "aiusage"("userId", "date");

-- CreateIndex
CREATE INDEX "aiusage_clientPhone_idx" ON "aiusage"("clientPhone");

-- AddForeignKey
ALTER TABLE "aiusage" ADD CONSTRAINT "aiusage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
