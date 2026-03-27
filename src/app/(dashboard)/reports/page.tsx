// src/app/(dashboard)/reports/page.tsx
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { ExpenseBarChart } from '@/components/expense-bar-chart';
import { KpiCards } from '@/components/kpi-cards';
import {
  getSummaryData,
  getExpenseBreakdownData,
} from '@/db/dashboard-queries';

export default async function ReportsPage() {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(),
    getExpenseBreakdownData(),
  ]);

  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="rounded-[24px] bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-500 p-5 text-white shadow-2xl sm:rounded-[28px] sm:p-6">
        <p className="text-sm text-blue-100">Laporan Keuangan</p>
        <h1 className="text-2xl font-bold md:text-4xl">Ringkasan & Grafik</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-50 md:text-base">
          Pantau pemasukan, pengeluaran, saldo, dan distribusi kategori pengeluaran.
        </p>
      </section>

      <KpiCards summary={summary} />

      <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <ExpensePieChart data={expenseData} />
        <ExpenseBarChart data={expenseData} />
      </section>
    </main>
  );
}