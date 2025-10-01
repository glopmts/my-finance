/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Fixed` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."GoalType" AS ENUM ('EXPENSE', 'SAVING', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "public"."CategoryEnum" AS ENUM ('TRANSPORTATION', 'FOOD', 'ACCOMMODATION', 'ENTERTAINMENT', 'HEALTHCARE', 'EDUCATION', 'UTILITIES', 'INVESTMENTS', 'SHOPPING', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Fixed" DROP CONSTRAINT "Fixed_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropIndex
DROP INDEX "public"."Budget_categoryId_idx";

-- DropIndex
DROP INDEX "public"."Transaction_categoryId_idx";

-- AlterTable
ALTER TABLE "public"."Budget" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."Fixed" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "categoryId",
ADD COLUMN     "category" "public"."CategoryEnum" NOT NULL DEFAULT 'EDUCATION',
ADD COLUMN     "financialGoalsId" TEXT;

-- DropTable
DROP TABLE "public"."Category";

-- DropEnum
DROP TYPE "public"."CategoryType";

-- CreateTable
CREATE TABLE "public"."FinancialGoals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "type" "public"."GoalType" NOT NULL DEFAULT 'EXPENSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "salaryId" TEXT,

    CONSTRAINT "FinancialGoals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialGoals_userId_idx" ON "public"."FinancialGoals"("userId");

-- CreateIndex
CREATE INDEX "FinancialGoals_month_year_idx" ON "public"."FinancialGoals"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialGoals_userId_month_year_type_key" ON "public"."FinancialGoals"("userId", "month", "year", "type");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_financialGoalsId_fkey" FOREIGN KEY ("financialGoalsId") REFERENCES "public"."FinancialGoals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialGoals" ADD CONSTRAINT "FinancialGoals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialGoals" ADD CONSTRAINT "FinancialGoals_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "public"."Salary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
