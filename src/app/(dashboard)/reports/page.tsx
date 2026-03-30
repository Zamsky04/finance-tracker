// src/app/(dashboard)/reports/page.tsx
import {
  getSummaryData,
  getExpenseBreakdownData,
} from '@/db/dashboard-queries';
import { requireUser } from '@/lib/auth';
import { ReportsClient } from './reports.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportsPage() {
  const user = await requireUser();

  const [summary, expenseData] = await Promise.all([
    getSummaryData(user.id),
    getExpenseBreakdownData(user.id),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialExpenseData={expenseData}
    />
  );
}