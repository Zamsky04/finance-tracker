// src/components/transaction-detail-sheet.tsx
'use client';

import { useState } from 'react';
import { formatDateTimeID } from '@/lib/date';
import { formatIDR } from '@/lib/money';
import type { TransactionItem } from './transaction-list';

type Props = {
  item: TransactionItem | null;
  onDeleted?: () => void;
};

export function TransactionDetailSheet({ item, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    const ok = window.confirm(`Hapus transaksi "${item.title}"?`);
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${item.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Gagal menghapus transaksi');
      }

      onDeleted?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Detail Transaksi</h3>
          <p className="text-sm text-slate-500">
            Foto bukti dan informasi lengkap transaksi
          </p>
        </div>

        {item ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        ) : null}
      </div>

      {!item ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Pilih salah satu transaksi untuk melihat detail.
        </div>
      ) : (
        <div className="space-y-4">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-56 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400">
              Tidak ada foto bukti
            </div>
          )}

          <div className="grid gap-3">
            <div>
              <p className="text-sm text-slate-500">Judul</p>
              <p className="font-semibold text-slate-900">{item.title}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Jenis</p>
              <p className={item.type === 'income' ? 'font-medium text-emerald-600' : 'font-medium text-rose-600'}>
                {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Nominal</p>
              <p className="font-semibold text-slate-900">{formatIDR(item.amount)}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Kategori</p>
              <p className="text-slate-900">{item.categoryName || 'Tanpa kategori'}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Tanggal & Waktu</p>
              <p className="text-slate-900">{formatDateTimeID(item.transactionAt)}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Catatan</p>
              <p className="text-slate-900">{item.note || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}