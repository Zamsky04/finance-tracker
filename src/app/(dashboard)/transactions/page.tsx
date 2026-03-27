// src/app/(dashboard)/transactions/page.tsx
import { getCategories } from '@/db/queries';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';

async function getTransactions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/transactions`,
    { cache: 'no-store' }
  );

  if (!res.ok) return [];
  return res.json();
}

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen px-0 py-0">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <section className="rounded-[24px] bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 p-5 text-white shadow-2xl sm:rounded-[28px] sm:p-6">
          <p className="text-sm text-blue-100">Manajemen Transaksi</p>
          <h1 className="text-2xl font-bold md:text-4xl">Semua Transaksi</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-50 md:text-base">
            Tambahkan dan lihat seluruh transaksi pemasukan maupun pengeluaran.
          </p>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr] xl:gap-6">
          <TransactionForm categories={categories} />
          <TransactionList items={transactions} />
        </section>
      </div>
    </main>
  );
}