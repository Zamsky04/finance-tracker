// src/components/transaction-detail-sheet.tsx
'use client';

import { useState } from 'react';
import { formatDateTimeID } from '@/lib/date';
import { formatIDR } from '@/lib/money';
import {
  Trash2,
  ImageOff,
  Tag,
  Clock,
  FileText,
  CreditCard,
  X,
  Expand,
} from 'lucide-react';
import type { TransactionItem } from './transaction-list';
import {
  getPaymentMethodLabel,
  getPaymentProviderMeta,
  renderPaymentMethodIcon,
} from '@/lib/payment';

type Props = {
  item: TransactionItem | null;
  onDeleted?: () => void;
};

function PaymentInfo({
  method,
  provider,
}: {
  method?: 'bank_transfer' | 'e_wallet' | 'cash' | null;
  provider?: string | null;
}) {
  if (!method) {
    return <span className="text-sm font-medium text-slate-400">–</span>;
  }

  const meta = getPaymentProviderMeta(provider);
  const label = meta?.label ?? (method === 'cash' ? 'Cash' : 'Provider');

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
      {meta?.logo ? (
        <img
          src={meta.logo}
          alt={label}
          className="h-5 w-5 rounded-sm object-contain"
        />
      ) : (
        renderPaymentMethodIcon(method, 'h-4 w-4')
      )}
      <span>{label}</span>
    </div>
  );
}

export function TransactionDetailSheet({ item, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-6 py-5">
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
              <div className="px-5 pt-5">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 text-left"
                >
                  <div className="relative h-72 w-full sm:h-80 lg:h-[24rem]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-contain bg-slate-100 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                      <Expand className="h-3.5 w-3.5" />
                      Klik untuk preview
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex h-36 flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
                <ImageOff className="h-5 w-5" />
                <p className="text-xs">Tidak ada foto bukti</p>
              </div>
            )}

            <div className="px-6 py-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Informasi lengkap transaksi terpilih
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
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
              <div className="flex items-start gap-3 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Kategori
                  </p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${
                      item.categoryName ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {item.categoryName || 'Tanpa kategori'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Pembayaran
                  </p>

                  <div className="mt-1">
                    <PaymentInfo
                      method={item.paymentMethod}
                      provider={item.paymentProvider}
                    />
                  </div>

                  <p
                    className={`mt-1.5 text-sm font-medium ${
                      item.paymentMethod ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {getPaymentMethodLabel(item.paymentMethod, item.paymentProvider)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Tanggal & Waktu
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">
                    {formatDateTimeID(item.transactionAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Catatan
                  </p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${
                      item.note ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {item.note || '–'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {item && previewOpen && item.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Preview bukti transaksi
                  </p>
                </div>
              </div>

              <div className="flex max-h-[85vh] items-center justify-center bg-slate-100 p-3 sm:p-5">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}