/*
  Warnings:

  - You are about to drop the column `isFixed` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Transaction_fixedId_key";

-- DropIndex
DROP INDEX "public"."Transaction_isFixed_idx";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "isFixed";

-- CreateIndex
CREATE INDEX "Transaction_fixedId_idx" ON "public"."Transaction"("fixedId");
