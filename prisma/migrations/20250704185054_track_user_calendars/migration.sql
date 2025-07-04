-- CreateTable
CREATE TABLE "additionalAICredit" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 10,
    "used" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripePaymentId" TEXT,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additionalAICredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additionalCalendar" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeSubscriptionId" TEXT,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additionalCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "additionalAICredit_userId_idx" ON "additionalAICredit"("userId");

-- CreateIndex
CREATE INDEX "additionalCalendar_userId_idx" ON "additionalCalendar"("userId");

-- AddForeignKey
ALTER TABLE "additionalAICredit" ADD CONSTRAINT "additionalAICredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additionalCalendar" ADD CONSTRAINT "additionalCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
