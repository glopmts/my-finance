/*
  Warnings:

  - You are about to drop the `_RecurringFolderToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecurringFolderToTransaction" DROP CONSTRAINT "_RecurringFolderToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecurringFolderToTransaction" DROP CONSTRAINT "_RecurringFolderToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "recurringFolders" ADD COLUMN     "category" "CategoryEnum" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "color" TEXT;

-- DropTable
DROP TABLE "_RecurringFolderToTransaction";

-- CreateTable
CREATE TABLE "_TransactionRecurringFolders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TransactionRecurringFolders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TransactionRecurringFolders_B_index" ON "_TransactionRecurringFolders"("B");

-- AddForeignKey
ALTER TABLE "_TransactionRecurringFolders" ADD CONSTRAINT "_TransactionRecurringFolders_A_fkey" FOREIGN KEY ("A") REFERENCES "recurringFolders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionRecurringFolders" ADD CONSTRAINT "_TransactionRecurringFolders_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
