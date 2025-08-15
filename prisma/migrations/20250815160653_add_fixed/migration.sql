/*
  Warnings:

  - A unique constraint covering the columns `[fixedId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "fixedId" TEXT,
ADD COLUMN     "isFixed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Fixed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "public"."Frequency" NOT NULL DEFAULT 'MONTHLY',
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fixed_userId_idx" ON "public"."Fixed"("userId");

-- CreateIndex
CREATE INDEX "Fixed_nextDueDate_idx" ON "public"."Fixed"("nextDueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_fixedId_key" ON "public"."Transaction"("fixedId");

-- CreateIndex
CREATE INDEX "Transaction_isFixed_idx" ON "public"."Transaction"("isFixed");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_fixedId_fkey" FOREIGN KEY ("fixedId") REFERENCES "public"."Fixed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fixed" ADD CONSTRAINT "Fixed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fixed" ADD CONSTRAINT "Fixed_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
