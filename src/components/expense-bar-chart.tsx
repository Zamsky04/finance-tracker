// src/components/expense-bar-chart.tsx
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Item = {
  category: string;
  color: string;
  total: number;
  percentage: number;
};

export function ExpenseBarChart({ data }: { data: Item[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Nominal Pengeluaran per Kategori
        </h3>
        <p className="text-sm text-slate-500">
          Perbandingan nominal pengeluaran berdasarkan kategori
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="category" tickLine={false} axisLine={false} />
            <YAxis
                tickLine={false}
                axisLine={false}
                width={80}
                tickFormatter={(value) => {
                    const n = Number(value);
                    if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)} M`;
                    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)} Jt`;
                    if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)} Rb`;
                    return `Rp ${n.toLocaleString('id-ID')}`;
                }}
            />
            <Tooltip
                formatter={(value, _name, item) => {
                    const payload = item?.payload as Item | undefined;
                    return [
                    `Rp ${Number(value).toLocaleString('id-ID')}`,
                    payload ? `${payload.category} (${payload.percentage}%)` : 'Kategori',
                    ];
                }}
            />
            <Bar dataKey="total" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}