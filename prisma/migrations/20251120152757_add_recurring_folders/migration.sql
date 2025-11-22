-- CreateTable
CREATE TABLE "recurringFolders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "Frequency" NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "recurringFolders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecurringFolderToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RecurringFolderToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "recurringFolders_userId_idx" ON "recurringFolders"("userId");

-- CreateIndex
CREATE INDEX "_RecurringFolderToTransaction_B_index" ON "_RecurringFolderToTransaction"("B");

-- AddForeignKey
ALTER TABLE "recurringFolders" ADD CONSTRAINT "recurringFolders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecurringFolderToTransaction" ADD CONSTRAINT "_RecurringFolderToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "recurringFolders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecurringFolderToTransaction" ADD CONSTRAINT "_RecurringFolderToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
