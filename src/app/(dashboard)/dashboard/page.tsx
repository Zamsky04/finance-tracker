// src/app/(dashboard)/dashboard/page.tsx
import { getCategories } from '@/db/queries';
import {
  getSummaryData,
  getExpenseBreakdownData,
  getTransactionsData,
} from '@/db/dashboard-queries';
import { DashboardClient } from './page.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function DashboardPage() {
  const [summary, expenseData, transactions, categories] = await Promise.all([
    getSummaryData(),
    getExpenseBreakdownData(),
    getTransactionsData(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-2xl">
          <p className="text-sm text-blue-100">Dashboard Keuangan</p>
          <h1 className="text-2xl font-bold md:text-4xl">
            Catatan pemasukan & pengeluaran
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-50 md:text-base">
            Kelola transaksi harian, lihat grafik pengeluaran, dan simpan bukti foto
            transaksi dengan tampilan premium yang nyaman di mobile.
          </p>
        </section>

        <DashboardClient
          initialTransactions={transactions}
          initialExpenseData={expenseData}
          initialSummary={summary}
          categories={categories}
        />
      </div>
    </main>
  );
}