'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  LineChart,
  ReceiptText,
} from 'lucide-react';

import { CashflowLineChart } from '@/components/cashflow-line-chart';
import { FiltersBar, type ReportFilters } from '@/components/filters-bar';
import { KpiCards } from '@/components/kpi-cards';
import {
  TransactionList,
  type TransactionItem,
} from '@/components/transaction-list';
import { TransactionDetailSheet } from '@/components/transaction-detail-sheet';
import { resolveDateRange } from '@/lib/utils';

type CashflowPoint = {
  date: string;
  income: number;
  expense: number;
};

type Summary = {
  total_income: number | string;
  total_expense: number | string;
  balance: number | string;
};

type Props = {
  initialTrendData: CashflowPoint[];
  initialSummary: Summary;
  initialTransactions: TransactionItem[];
};

function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function ReportsClient({
  initialTrendData,
  initialSummary,
  initialTransactions,
}: Props) {
  const initialFilter = useMemo<ReportFilters>(
    () => ({
      mode: 'day',
      baseDate: today(),
    }),
    []
  );

  const initialRange = useMemo(() => resolveDateRange(initialFilter), [initialFilter]);

  const [trendData, setTrendData] = useState<CashflowPoint[]>(initialTrendData);
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [transactions, setTransactions] =
    useState<TransactionItem[]>(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(initialTransactions[0] ?? null);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState(initialRange.label);
  const [currentFilter, setCurrentFilter] = useState<ReportFilters>(initialFilter);

  const incomeCount = useMemo(
    () => transactions.filter((item) => item.type === 'income').length,
    [transactions]
  );

  const expenseCount = useMemo(
    () => transactions.filter((item) => item.type === 'expense').length,
    [transactions]
  );

  const reloadAll = async (filter = currentFilter) => {
    setLoading(true);

    try {
      const range = resolveDateRange(filter);
      const params = new URLSearchParams();

      if (range.from) params.set('from', range.from);
      if (range.to) params.set('to', range.to);

      const query = params.toString() ? `?${params.toString()}` : '';

      const [trendRes, summaryRes, txRes] = await Promise.all([
        fetch(`/api/reports/cashflow-trend${query}`, {
          method: 'GET',
          cache: 'no-store',
        }),
        fetch(`/api/reports/summary${query}`, {
          method: 'GET',
          cache: 'no-store',
        }),
        fetch(`/api/transactions${query}`, {
          method: 'GET',
          cache: 'no-store',
        }),
      ]);

      const trendRaw = trendRes.ok ? await trendRes.json() : [];
      const summaryRaw = summaryRes.ok
        ? await summaryRes.json()
        : { total_income: 0, total_expense: 0, balance: 0 };
      const txRaw = txRes.ok ? await txRes.json() : [];

      const normalizedTrend: CashflowPoint[] = Array.isArray(trendRaw)
        ? trendRaw.map(
            (item: CashflowPoint & { income: string | number; expense: string | number }) => ({
              ...item,
              income: Number(item.income || 0),
              expense: Number(item.expense || 0),
            })
          )
        : [];

      const normalizedTransactions: TransactionItem[] = Array.isArray(txRaw) ? txRaw : [];

      setTrendData(normalizedTrend);
      setSummary(summaryRaw);
      setTransactions(normalizedTransactions);
      setFilterLabel(range.label);

      setSelectedTransaction((prev) => {
        if (!normalizedTransactions.length) return null;
        if (!prev) return normalizedTransactions[0];
        return (
          normalizedTransactions.find((item) => item.id === prev.id) ??
          normalizedTransactions[0]
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async (filters: ReportFilters) => {
    setCurrentFilter(filters);
    await reloadAll(filters);
  };

  const handleDeleted = async () => {
    await reloadAll();
  };

  useEffect(() => {
    if (!transactions.length) {
      setSelectedTransaction(null);
      return;
    }

    setSelectedTransaction((prev) => {
      if (!prev) return transactions[0];
      return transactions.find((item) => item.id === prev.id) ?? transactions[0];
    });
  }, [transactions]);

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-5 px-1 sm:space-y-6 sm:px-2">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-500 px-5 py-6 text-white shadow-[0_20px_60px_-20px_rgba(37,99,235,0.55)] sm:px-6 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-8 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/90">
              Laporan Keuangan
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Ringkasan, Grafik, dan Detail Transaksi
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
              Semua insight keuangan dalam satu halaman yang lebih rapi, jelas,
              dan mudah dipantau.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[11px] text-blue-100/80">Total Data</p>
              <p className="mt-1 text-lg font-semibold">{transactions.length}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[11px] text-blue-100/80">Pemasukan</p>
              <p className="mt-1 text-lg font-semibold">{incomeCount}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] text-blue-100/80">Pengeluaran</p>
              <p className="mt-1 text-lg font-semibold">{expenseCount}</p>
            </div>
          </div>
        </div>
      </section>

      <FiltersBar onApply={handleApplyFilter} />

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5 rounded-2xl bg-blue-50 px-3.5 py-3 text-blue-700">
            <CalendarDays className="h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-sm">
              Periode aktif: <span className="font-semibold">{filterLabel}</span>
              {loading && <span className="ml-2 text-xs text-blue-400">Memuat data...</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {incomeCount} pemasukan
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              {expenseCount} pengeluaran
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <ReceiptText className="h-3.5 w-3.5" />
              {transactions.length} transaksi
            </span>
          </div>
        </div>
      </section>

      <KpiCards summary={summary} />

      <section className="grid gap-6 2xl:grid-cols-12 2xl:gap-8">
        <div className="2xl:col-span-7 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  Grafik Cashflow
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pola pemasukan dan pengeluaran pada periode terpilih
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <CashflowLineChart data={trendData} />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-5 py-4 sm:px-6">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Daftar Transaksi Periode Ini
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Klik salah satu transaksi untuk melihat detail lengkapnya
              </p>
            </div>

            <div className="p-3 sm:p-4">
              <TransactionList
                items={transactions}
                onSelect={(item) => setSelectedTransaction(item)}
                selectedId={selectedTransaction?.id ?? null}
              />
            </div>
          </div>
        </div>

        <div className="2xl:col-span-5">
          <div className="xl:sticky xl:top-6">
            <TransactionDetailSheet
              item={selectedTransaction}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
      </section>
    </main>
  );
}