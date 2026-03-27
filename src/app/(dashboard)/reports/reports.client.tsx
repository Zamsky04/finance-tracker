'use client';

import { useState } from 'react';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { ExpenseBarChart } from '@/components/expense-bar-chart';
import { FiltersBar, type ReportFilters } from '@/components/filters-bar';
import { KpiCards } from '@/components/kpi-cards';
import { resolveDateRange } from '@/lib/utils';

type ExpenseItem = {
  category: string;
  color: string;
  total: number;
  percentage: number;
};

type Summary = {
  total_income: number | string;
  total_expense: number | string;
  balance: number | string;
};

type Props = {
  initialExpenseData: ExpenseItem[];
  initialSummary: Summary;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ReportsClient({
  initialExpenseData,
  initialSummary,
}: Props) {
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>(initialExpenseData);
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState('Hari ini');

  const [currentFilter, setCurrentFilter] = useState<ReportFilters>({
    mode: 'day',
    baseDate: today(),
  });

  const reloadAll = async (filter = currentFilter) => {
    setLoading(true);

    try {
      const range = resolveDateRange(filter);
      const params = new URLSearchParams();

      if (range.from) params.set('from', range.from);
      if (range.to) params.set('to', range.to);

      const query = params.toString() ? `?${params.toString()}` : '';

      const [expenseRes, summaryRes] = await Promise.all([
        fetch(`/api/reports/expense-breakdown${query}`, { cache: 'no-store' }),
        fetch(`/api/reports/summary${query}`, { cache: 'no-store' }),
      ]);

      const expData = expenseRes.ok ? await expenseRes.json() : [];
      const sumData = summaryRes.ok
        ? await summaryRes.json()
        : { total_income: 0, total_expense: 0, balance: 0 };

      setExpenseData(expData);
      setSummary(sumData);
      setFilterLabel(range.label);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async (filters: ReportFilters) => {
    setCurrentFilter(filters);
    await reloadAll(filters);
  };

  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="rounded-[24px] bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-500 p-5 text-white shadow-2xl sm:rounded-[28px] sm:p-6">
        <p className="text-sm text-blue-100">Laporan Keuangan</p>
        <h1 className="text-2xl font-bold md:text-4xl">Ringkasan & Grafik</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-50 md:text-base">
          Pantau pemasukan, pengeluaran, saldo, dan distribusi kategori berdasarkan periode.
        </p>
      </section>

      <FiltersBar onApply={handleApplyFilter} />

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
        Periode aktif: <span className="font-semibold">{filterLabel}</span>
        {loading ? ' • Memuat data...' : ''}
      </div>

      <KpiCards summary={summary} />

      <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <ExpensePieChart data={expenseData} />
        <ExpenseBarChart data={expenseData} />
      </section>
    </main>
  );
}