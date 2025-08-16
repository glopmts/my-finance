/*
  Warnings:

  - A unique constraint covering the columns `[originId]` on the table `Fixed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originId` to the `Fixed` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Transaction_fixedId_idx";

-- AlterTable
ALTER TABLE "public"."Fixed" ADD COLUMN     "originId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fixed_originId_key" ON "public"."Fixed"("originId");

-- AddForeignKey
ALTER TABLE "public"."Fixed" ADD CONSTRAINT "Fixed_originId_fkey" FOREIGN KEY ("originId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
