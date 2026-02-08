-- AlterEnum: Add DRAFT status to ChangeStatus enum (before SUBMITTED)
ALTER TYPE "ChangeStatus" ADD VALUE 'DRAFT' BEFORE 'SUBMITTED';

-- AlterTable: Add new columns to ChangeOrder table
ALTER TABLE "ChangeOrder" ADD COLUMN "scopeImpact" TEXT;
ALTER TABLE "ChangeOrder" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "ChangeOrder" ALTER COLUMN "submittedDate" DROP NOT NULL;

-- AlterTable: Add changeOrderId to Task table
ALTER TABLE "Task" ADD COLUMN "changeOrderId" TEXT;

-- AlterTable: Add changeOrderId to BudgetLine table
ALTER TABLE "BudgetLine" ADD COLUMN "changeOrderId" TEXT;

-- AddForeignKey: Link Task to ChangeOrder
ALTER TABLE "Task" ADD CONSTRAINT "Task_changeOrderId_fkey" FOREIGN KEY ("changeOrderId") REFERENCES "ChangeOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Link BudgetLine to ChangeOrder
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_changeOrderId_fkey" FOREIGN KEY ("changeOrderId") REFERENCES "ChangeOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
