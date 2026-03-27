'use client';

import { useState } from 'react';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionDetailSheet } from '@/components/transaction-detail-sheet';
import { TransactionList, type TransactionItem } from '@/components/transaction-list';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
};

type Props = {
  initialTransactions: TransactionItem[];
  categories: Category[];
};

export function TransactionsClient({
  initialTransactions,
  categories,
}: Props) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [selected, setSelected] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(false);

  const reloadTransactions = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/transactions', { cache: 'no-store' });
      const data = res.ok ? await res.json() : [];

      setTransactions(data);

      if (selected) {
        const found = data.find((item: TransactionItem) => item.id === selected.id) || null;
        setSelected(found);
      }
    } finally {
      setLoading(false);
    }
  };

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

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {loading ? 'Memuat data transaksi...' : `Total transaksi: ${transactions.length}`}
        </div>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr] xl:gap-6">
          <TransactionForm categories={categories} onCreated={reloadTransactions} />
          <TransactionList items={transactions} onSelect={setSelected} />
        </section>

        <TransactionDetailSheet
          item={selected}
          onDeleted={async () => {
            setSelected(null);
            await reloadTransactions();
          }}
        />
      </div>
    </main>
  );
}