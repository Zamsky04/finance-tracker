'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Summary = {
  total_income: number | string;
  total_expense: number | string;
  balance?: number | string;
};

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: ChartItem; value: number }[];
};

function toNumber(value: number | string | null | undefined) {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} Jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} Rb`;
  }
  return String(value);
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">{item.name}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">
        Rp {item.value.toLocaleString('id-ID')}
      </p>
    </div>
  );
}

export function IncomeExpenseChart({ summary }: { summary: Summary }) {
  const income = toNumber(summary.total_income);
  const expense = toNumber(summary.total_expense);

  const data: ChartItem[] = [
    {
      name: 'Pemasukan',
      value: income,
      color: '#22c55e',
    },
    {
      name: 'Pengeluaran',
      value: expense,
      color: '#ef4444',
    },
  ];

  const hasData = income > 0 || expense > 0;

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Pemasukan vs Pengeluaran
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Perbandingan total pemasukan dan pengeluaran pada periode terpilih
        </p>
      </div>

      <div className="min-w-0 p-5">
        {!hasData ? (
          <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400">
            Belum ada data untuk ditampilkan
          </div>
        ) : (
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="35%">
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={76}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(Number(value))
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={72}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}