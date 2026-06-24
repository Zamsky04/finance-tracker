// src/app/(dashboard)/transactions/transactions.client.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionDetailSheet } from '@/components/transaction-detail-sheet';
import { TransactionList, type TransactionItem } from '@/components/transaction-list';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Wifi } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
};

type Props = {
  userId: string;
  initialTransactions: TransactionItem[];
  categories: Category[];
};

export function TransactionsClient({ userId, initialTransactions, categories }: Props) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [selected, setSelected] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  );
  const selectedRef = useRef<TransactionItem | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  selectedRef.current = selected;

  const reloadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', { cache: 'no-store' });
      const data = res.ok ? await res.json() : [];
      setTransactions(data);
      const currentSelected = selectedRef.current;
      if (currentSelected) {
        const found = data.find((item: TransactionItem) => item.id === currentSelected.id) || null;
        setSelected(found);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
          reloadTimerRef.current = setTimeout(() => {
            void reloadTransactions();
          }, 350);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('error');
        }
      });

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-5 text-white shadow-[0_8px_40px_-8px_rgba(15,23,42,0.4)] sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-12 right-14 h-52 w-52 rounded-full bg-white/5" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
            Manajemen Transaksi
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
            Semua Transaksi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 md:text-base">
            Tambahkan dan lihat seluruh transaksi pemasukan maupun pengeluaran.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500">Memuat data transaksi...</p>
              </>
            ) : (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                  {transactions.length}
                </span>
                <p className="text-sm font-medium text-slate-600">Total transaksi</p>
              </>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              realtimeStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-600'
                : realtimeStatus === 'error'
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-slate-50 text-slate-500'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            {realtimeStatus === 'connected'
              ? 'Realtime aktif'
              : realtimeStatus === 'error'
                ? 'Realtime belum aktif'
                : 'Menghubungkan realtime'}
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr] xl:gap-6">
          <TransactionForm categories={categories} onCreated={reloadTransactions} />
          <TransactionList items={transactions} onSelect={setSelected} selectedId={selected?.id} />
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
