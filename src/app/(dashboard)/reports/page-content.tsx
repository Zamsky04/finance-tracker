import {
  getCashflowTrendData,
  getSummaryData,
} from '@/db/dashboard-queries';
import { ReportsClient } from './reports.client';

type Props = {
  userId: string;
};

export async function ReportsPageContent({ userId }: Props) {
  const [summary, trendData] = await Promise.all([
    getSummaryData(userId),
    getCashflowTrendData(userId),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialTrendData={trendData}
    />
  );
}