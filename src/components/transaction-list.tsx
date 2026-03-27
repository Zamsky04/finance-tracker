// src/components/transaction-list.tsx
'use client';
 
import { formatDateTimeID } from '@/lib/date';
import { formatIDR } from '@/lib/money';
import { ArrowDownLeft, ArrowUpRight, ListX } from 'lucide-react';
 
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
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]">
 
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">Daftar Transaksi</h3>
        <p className="mt-0.5 text-xs text-slate-500">Riwayat pemasukan dan pengeluaran terbaru</p>
      </div>
 
      <div className="divide-y divide-slate-50 px-3 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ListX className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">Belum ada transaksi</p>
            <p className="text-xs text-slate-400">Tambahkan transaksi pertamamu di form sebelah kiri.</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              className="group w-full rounded-2xl px-3 py-3.5 text-left transition-all duration-150 hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                    item.type === 'income'
                      ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-400 group-hover:bg-rose-100'
                  }`}
                >
                  {item.type === 'income' ? (
                    <ArrowUpRight className="h-4.5 w-4.5" size={18} />
                  ) : (
                    <ArrowDownLeft className="h-4.5 w-4.5" size={18} />
                  )}
                </div>
 
                {/* Title & meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {item.categoryName || 'Tanpa kategori'}
                    <span className="mx-1.5 text-slate-300">•</span>
                    {formatDateTimeID(item.transactionAt)}
                  </p>
                </div>
 
                {/* Amount */}
                <div
                  className={`shrink-0 text-right text-sm font-bold tabular-nums ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {item.type === 'income' ? '+' : '−'}&nbsp;
                  {formatIDR(item.amount)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}