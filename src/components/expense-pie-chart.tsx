'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type Item = {
  category: string;
  color: string;
  total: number;
  percentage: number;
};

export function ExpensePieChart({ data }: { data: Item[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Persentase Pengeluaran
        </h3>
        <p className="text-sm text-slate-500">
          Berdasarkan kategori pada periode terpilih
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, _name, item) => {
                const payload = item?.payload as Item | undefined;

                return [
                  `Rp ${Number(value).toLocaleString('id-ID')}`,
                  payload
                    ? `${payload.category} (${payload.percentage}%)`
                    : 'Kategori',
                ];
              }}
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}