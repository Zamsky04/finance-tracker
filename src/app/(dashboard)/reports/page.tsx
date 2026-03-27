import {
  getSummaryData,
  getExpenseBreakdownData,
} from '@/db/dashboard-queries';
import { ReportsClient } from './reports.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportsPage() {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(),
    getExpenseBreakdownData(),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialExpenseData={expenseData}
    />
  );
}