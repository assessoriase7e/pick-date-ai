-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "collaboratorName" TEXT,
ADD COLUMN     "comboId" INTEGER,
ADD COLUMN     "comboName" TEXT,
ADD COLUMN     "serviceName" TEXT;

-- CreateTable
CREATE TABLE "combo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comboService" (
    "id" SERIAL NOT NULL,
    "comboId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "serviceName" TEXT NOT NULL,
    "servicePrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comboService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientCombo" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "comboId" INTEGER,
    "comboName" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "amountPaid" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientCombo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientComboSession" (
    "id" SERIAL NOT NULL,
    "clientComboId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "serviceName" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "usedSessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientComboSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "combo" ADD CONSTRAINT "combo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comboService" ADD CONSTRAINT "comboService_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comboService" ADD CONSTRAINT "comboService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientCombo" ADD CONSTRAINT "clientCombo_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientCombo" ADD CONSTRAINT "clientCombo_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "combo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientComboSession" ADD CONSTRAINT "clientComboSession_clientComboId_fkey" FOREIGN KEY ("clientComboId") REFERENCES "clientCombo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientComboSession" ADD CONSTRAINT "clientComboSession_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "clientCombo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
