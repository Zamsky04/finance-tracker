'use client';

import { useState } from 'react';
import { formatDateTimeID } from '@/lib/date';
import { formatIDR } from '@/lib/money';
import { Trash2, ImageOff, Tag, Clock, FileText, CreditCard } from 'lucide-react';
import type { TransactionItem } from './transaction-list';

type Props = {
  item: TransactionItem | null;
  onDeleted?: () => void;
};

function formatPayment(
  method?: 'bank_transfer' | 'e_wallet' | 'cash' | null,
  provider?: string | null
) {
  if (!method) return '–';
  if (method === 'cash') return 'Cash';

  const providerLabelMap: Record<string, string> = {
    bca: 'BCA',
    bri: 'BRI',
    mandiri: 'Mandiri',
    bni: 'BNI',
    seabank: 'SeaBank',
    cimb_niaga: 'CIMB Niaga',
    permata: 'Permata',
    btn: 'BTN',
    danamon: 'Danamon',
    bsi: 'BSI',
    gopay: 'GoPay',
    ovo: 'OVO',
    shopeepay: 'ShopeePay',
    dana: 'DANA',
    linkaja: 'LinkAja',
  };

  const providerLabel = provider ? providerLabelMap[provider] ?? provider : '';

  if (method === 'bank_transfer') {
    return providerLabel ? `Transfer Bank - ${providerLabel}` : 'Transfer Bank';
  }

  if (method === 'e_wallet') {
    return providerLabel ? `E-Wallet - ${providerLabel}` : 'E-Wallet';
  }

  return '–';
}

export function TransactionDetailSheet({ item, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    const ok = window.confirm(`Hapus transaksi "${item.title}"?`);
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${item.id}`, { method: 'DELETE' });
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
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Detail Transaksi
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Foto bukti dan informasi lengkap transaksi
          </p>
        </div>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-60"
          >
            {loading ? (
              'Menghapus...'
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </>
            )}
          </button>
        )}
      </div>

      {!item ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <CreditCard className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Pilih transaksi untuk melihat detail
          </p>
          <p className="text-xs text-slate-400">
            Klik salah satu transaksi dari daftar di sebelah kiri
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {item.imageUrl ? (
            <div className="relative h-52 overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
              <ImageOff className="h-5 w-5" />
              <p className="text-xs">Tidak ada foto bukti</p>
            </div>
          )}

          <div className="px-6 py-5">
            <div className="mb-4">
              <p className="text-lg font-semibold text-slate-900">{item.title}</p>
              <span
                className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  item.type === 'income'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-500'
                }`}
              >
                {item.type === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
              </span>
            </div>

            <p
              className={`text-2xl font-bold tracking-tight ${
                item.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {formatIDR(item.amount)}
            </p>
          </div>

          <div className="grid gap-0 divide-y divide-slate-50 px-6">
            {[
              {
                Icon: Tag,
                label: 'Kategori',
                value: item.categoryName || 'Tanpa kategori',
                muted: !item.categoryName,
              },
              {
                Icon: CreditCard,
                label: 'Pembayaran',
                value: formatPayment(item.paymentMethod, item.paymentProvider),
                muted: !item.paymentMethod,
              },
              {
                Icon: Clock,
                label: 'Tanggal & Waktu',
                value: formatDateTimeID(item.transactionAt),
                muted: false,
              },
              {
                Icon: FileText,
                label: 'Catatan',
                value: item.note || '–',
                muted: !item.note,
              },
            ].map(({ Icon, label, value, muted }) => (
              <div key={label} className="flex items-start gap-3 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    {label}
                  </p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${
                      muted ? 'text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}