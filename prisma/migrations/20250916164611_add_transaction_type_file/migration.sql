-- CreateEnum
CREATE TYPE "public"."TransactionTypeFile" AS ENUM ('CSV', 'PDF', 'NULL');

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "typeFile" "public"."TransactionTypeFile" NOT NULL DEFAULT 'NULL',
ALTER COLUMN "type" SET DEFAULT 'INCOME';
