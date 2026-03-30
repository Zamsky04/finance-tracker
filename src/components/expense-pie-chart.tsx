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
  const hasData = data.some((item) => Number(item.total) > 0);

  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Persentase Pengeluaran
        </h3>
        <p className="text-sm text-slate-500">
          Berdasarkan kategori pada periode terpilih
        </p>
      </div>

      <div className="h-[320px] min-h-[320px] w-full min-w-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                isAnimationActive={false}
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
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Belum ada data pengeluaran untuk ditampilkan.
          </div>
        )}
      </div>
    </div>
  );
}