-- CreateTable
CREATE TABLE "public"."MonthlyBalance" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MonthlyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyBalance_userId_idx" ON "public"."MonthlyBalance"("userId");

-- CreateIndex
CREATE INDEX "MonthlyBalance_month_year_idx" ON "public"."MonthlyBalance"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalance_userId_month_year_key" ON "public"."MonthlyBalance"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "public"."MonthlyBalance" ADD CONSTRAINT "MonthlyBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
