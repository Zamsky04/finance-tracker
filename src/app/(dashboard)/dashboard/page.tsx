import { KpiCards } from '@/components/kpi-cards';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { getSummaryData, getExpenseBreakdownData } from '@/db/dashboard-queries';
 
export const dynamic = 'force-dynamic';
export const revalidate = 0;
 
export default async function DashboardPage() {
  const [summary, expenseData] = await Promise.all([
    getSummaryData(),
    getExpenseBreakdownData(),
  ]);
 
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
 
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-[0_8px_40px_-8px_rgba(37,99,235,0.45)] md:p-8">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-64 w-64 rounded-full bg-white/5" />
 
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            Dashboard Keuangan
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
            Ringkasan keuangan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 md:text-base">
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