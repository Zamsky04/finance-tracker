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
 
type Item = {
  category: string;
  color: string;
  total: number;
  percentage: number;
};
 
type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: Item; value: number }[];
};
 
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
 
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">{item.category}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">
        Rp {item.total.toLocaleString('id-ID')}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">{item.percentage}% dari total</p>
    </div>
  );
}
 
export function ExpenseBarChart({ data }: { data: Item[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]">
 
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Pengeluaran per Kategori
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Perbandingan nominal pengeluaran berdasarkan kategori
        </p>
      </div>
 
      <div className="p-5">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400">
            Tidak ada data pengeluaran
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="35%">
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={76}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(value) => {
                    const n = Number(value);
                    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`;
                    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Jt`;
                    if (n >= 1_000) return `${(n / 1_000).toFixed(0)} Rb`;
                    return String(n);
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 12 }} />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} maxBarSize={48}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
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