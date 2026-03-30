import { KpiCards } from '@/components/kpi-cards';
import { CashflowLineChart } from '@/components/cashflow-line-chart';
import { getCashflowTrendData, getSummaryData } from '@/db/dashboard-queries';

type Props = {
  userId: string;
};

export async function DashboardPageContent({ userId }: Props) {
  const [summary, trendData] = await Promise.all([
    getSummaryData(userId),
    getCashflowTrendData(userId),
  ]);

  return (
    <>
      <KpiCards summary={summary} />

      <section className="grid gap-4 lg:grid-cols-1 lg:gap-6">
        <CashflowLineChart data={trendData} />
      </section>
    </>
  );
}