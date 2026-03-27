import { KpiCards } from '@/components/kpi-cards';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import {
  getSummaryData,
  getExpenseBreakdownData,
} from '@/db/dashboard-queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(),
    getExpenseBreakdownData(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-2xl">
          <p className="text-sm text-blue-100">Dashboard Keuangan</p>
          <h1 className="text-2xl font-bold md:text-4xl">Ringkasan keuangan</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-50 md:text-base">
            Lihat total pemasukan, pengeluaran, dan saldo secara cepat dalam satu halaman.
          </p>
        </section>

        <KpiCards summary={summary} />

        <section className="grid gap-4 lg:grid-cols-1 lg:gap-6">
          <ExpensePieChart data={expenseData} />
        </section>
      </div>
    </main>
  );
}