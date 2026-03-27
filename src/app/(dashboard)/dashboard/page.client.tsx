// src/app/(dashboard)/dashboard/page.client.tsx
'use client';

import { useState } from 'react';
import { TransactionForm } from '@/components/transaction-form';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { ExpenseBarChart } from '@/components/expense-bar-chart';
import { TransactionDetailSheet } from '@/components/transaction-detail-sheet';
import { TransactionList, type TransactionItem } from '@/components/transaction-list';
import { FiltersBar, type FilterMode } from '@/components/filters-bar';
import { KpiCards } from '@/components/kpi-cards';
import { resolveDateRange } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string | null;
};

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
  initialTransactions: TransactionItem[];
  initialExpenseData: ExpenseItem[];
  initialSummary: Summary;
  categories: Category[];
};

type CurrentFilter = {
  mode: FilterMode;
  baseDate: string;
  from?: string;
  to?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardClient({
  initialTransactions,
  initialExpenseData,
  initialSummary,
  categories,
}: Props) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>(initialExpenseData);
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [selected, setSelected] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState('Hari ini');

  const [currentFilter, setCurrentFilter] = useState<CurrentFilter>({
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

      const [txRes, expenseRes, summaryRes] = await Promise.all([
        fetch(`/api/transactions${query}`, { cache: 'no-store' }),
        fetch(`/api/reports/expense-breakdown${query}`, { cache: 'no-store' }),
        fetch(`/api/reports/summary${query}`, { cache: 'no-store' }),
      ]);

      const txData = txRes.ok ? await txRes.json() : [];
      const expData = expenseRes.ok ? await expenseRes.json() : [];
      const sumData = summaryRes.ok
        ? await summaryRes.json()
        : { total_income: 0, total_expense: 0, balance: 0 };

      setTransactions(txData);
      setExpenseData(expData);
      setSummary(sumData);
      setFilterLabel(range.label);

      if (selected) {
        const found = txData.find((item: TransactionItem) => item.id === selected.id) || null;
        setSelected(found);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async (filters: CurrentFilter) => {
    setCurrentFilter(filters);
    await reloadAll(filters);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
        <KpiCards summary={summary} />

        <FiltersBar onApply={handleApplyFilter} />

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
        Periode aktif: <span className="font-semibold">{filterLabel}</span>
        {loading ? ' • Memuat data...' : ''}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <TransactionForm categories={categories} onCreated={() => reloadAll()} />
        <ExpensePieChart data={expenseData} />
        </section>

        <section>
        <ExpenseBarChart data={expenseData} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr] lg:gap-6">
        <TransactionList items={transactions} onSelect={setSelected} />
        <TransactionDetailSheet
            item={selected}
            onDeleted={async () => {
            setSelected(null);
            await reloadAll();
            }}
        />
        </section>
    </div>
    );
}