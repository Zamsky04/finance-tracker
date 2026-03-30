import {
  getExpenseBreakdownData,
  getSummaryData,
} from '@/db/dashboard-queries';
import { ReportsClient } from './reports.client';

type Props = {
  userId: string;
};

export async function ReportsPageContent({ userId }: Props) {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(userId),
    getExpenseBreakdownData(userId),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialExpenseData={expenseData}
    />
  );
}