import { formatIDR } from '@/lib/money';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type Props = {
  summary: {
    total_income: number | string;
    total_expense: number | string;
    balance: number | string;
  };
};

export function KpiCards({ summary }: Props) {
  const cards = [
    {
      label: 'Total Pemasukan',
      value: formatIDR(summary.total_income),
      Icon: TrendingUp,
      valueClass: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      borderAccent: 'before:bg-emerald-400',
    },
    {
      label: 'Total Pengeluaran',
      value: formatIDR(summary.total_expense),
      Icon: TrendingDown,
      valueClass: 'text-rose-500',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-400',
      borderAccent: 'before:bg-rose-400',
    },
    {
      label: 'Saldo',
      value: formatIDR(summary.balance),
      Icon: Wallet,
      valueClass: 'text-slate-900',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderAccent: 'before:bg-blue-400',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map(({ label, value, Icon, valueClass, iconBg, iconColor, borderAccent }) => (
        <div
          key={label}
          className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-[0_4px_24px_-6px_rgba(30,64,175,0.08)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full ${borderAccent}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
          <h2 className={`mt-3 text-2xl font-bold tracking-tight ${valueClass}`}>{value}</h2>
        </div>
      ))}
    </section>
  );
}