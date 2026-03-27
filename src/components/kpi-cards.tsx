import { formatIDR } from '@/lib/money';

type Props = {
  summary: {
    total_income: number | string;
    total_expense: number | string;
    balance: number | string;
  };
};

export function KpiCards({ summary }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-500">Total Pemasukan</p>
        <h2 className="mt-2 text-2xl font-bold text-emerald-600">
          {formatIDR(summary.total_income)}
        </h2>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-500">Total Pengeluaran</p>
        <h2 className="mt-2 text-2xl font-bold text-rose-600">
          {formatIDR(summary.total_expense)}
        </h2>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-500">Saldo</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {formatIDR(summary.balance)}
        </h2>
      </div>
    </section>
  );
}