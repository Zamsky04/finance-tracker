'use client';
 
import { useState } from 'react';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { ExpenseBarChart } from '@/components/expense-bar-chart';
import { FiltersBar, type ReportFilters } from '@/components/filters-bar';
import { KpiCards } from '@/components/kpi-cards';
import { resolveDateRange } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

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
  return format(new Date(), 'yyyy-MM-dd');
}
 
export function ReportsClient({ initialExpenseData, initialSummary }: Props) {
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
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-500 p-5 text-white shadow-[0_8px_40px_-8px_rgba(79,70,229,0.4)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-14 right-16 h-56 w-56 rounded-full bg-white/5" />
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
          Laporan Keuangan
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
          Ringkasan &amp; Grafik
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 md:text-base">
          Pantau pemasukan, pengeluaran, saldo, dan distribusi kategori berdasarkan periode.
        </p>
      </section>
 
      <FiltersBar onApply={handleApplyFilter} />
 
      {/* Period badge */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700">
          Periode aktif:{' '}
          <span className="font-semibold">{filterLabel}</span>
          {loading && (
            <span className="ml-2 text-xs text-blue-400">Memuat data...</span>
          )}
        </p>
      </div>
 
      <KpiCards summary={summary} />
 
      <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <ExpensePieChart data={expenseData} />
        <ExpenseBarChart data={expenseData} />
      </section>
    </main>
  );
}