import {
  getCashflowTrendData,
  getSummaryData,
  getTransactionsData,
} from '@/db/dashboard-queries';
import { ReportsClient } from './reports.client';

type Props = {
  userId: string;
};

export async function ReportsPageContent({ userId }: Props) {
  const [summary, trendData, transactions] = await Promise.all([
    getSummaryData(userId),
    getCashflowTrendData(userId),
    getTransactionsData(userId),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialTrendData={trendData}
      initialTransactions={transactions}
    />
  );
}