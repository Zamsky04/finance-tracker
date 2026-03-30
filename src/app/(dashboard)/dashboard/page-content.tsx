import { KpiCards } from '@/components/kpi-cards';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { getExpenseBreakdownData, getSummaryData } from '@/db/dashboard-queries';

type Props = {
  userId: string;
};

export async function DashboardPageContent({ userId }: Props) {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(userId),
    getExpenseBreakdownData(userId),
  ]);

  return (
    <>
      <KpiCards summary={summary} />

      <section className="grid gap-4 lg:grid-cols-1 lg:gap-6">
        <ExpensePieChart data={expenseData} />
      </section>
    </>
  );
}