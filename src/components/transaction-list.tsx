'use client';

import { formatDateTimeID } from '@/lib/date';
import { formatIDR } from '@/lib/money';

export type TransactionItem = {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: string | number;
  note: string | null;
  transactionAt: string | Date;
  imageUrl?: string | null;
  imagePath?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
};

type Props = {
  items: TransactionItem[];
  onSelect?: (item: TransactionItem) => void;
};

export function TransactionList({ items, onSelect }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Daftar Transaksi</h3>
        <p className="text-sm text-slate-500">Riwayat pemasukan dan pengeluaran terbaru</p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Belum ada transaksi.
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.categoryName || 'Tanpa kategori'} • {formatDateTimeID(item.transactionAt)}
                  </p>
                </div>

                <div
                  className={`shrink-0 text-right font-bold ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'} {formatIDR(item.amount)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}