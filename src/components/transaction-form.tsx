// src/components/transaction-form.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getNowLocalISOString } from '@/lib/date';

type TxType = 'income' | 'expense';

type Category = {
  id: string;
  name: string;
  type: TxType;
  color?: string | null;
};

type TransactionFormProps = {
  categories?: Category[];
  onCreated?: () => void | Promise<void>;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatRupiahInput(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digits));
}

export function TransactionForm({
  categories = [],
  onCreated,
}: TransactionFormProps) {
  const router = useRouter();

  const [type, setType] = useState<TxType>('expense');
  const [title, setTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountValue, setAmountValue] = useState<number>(0);
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionAt, setTransactionAt] = useState(getNowLocalISOString());
  const [autoTime, setAutoTime] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoTime) return;

    const timer = setInterval(() => {
      setTransactionAt(getNowLocalISOString());
    }, 1000);

    return () => clearInterval(timer);
  }, [autoTime]);

  const filteredCategories = useMemo(
    () => categories.filter((item) => item.type === type),
    [categories, type]
  );

  const handleTypeChange = (value: TxType) => {
    setType(value);
    setCategoryId('');
    setTransactionAt(getNowLocalISOString());
    setAutoTime(true);
  };

  const handleAmountChange = (value: string) => {
    const digits = digitsOnly(value);
    setAmountInput(formatRupiahInput(digits));
    setAmountValue(digits ? Number(digits) : 0);
  };

  const handleDateChange = (value: string) => {
    setTransactionAt(value);
    setAutoTime(false);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const toastId = toast.loading('Mengupload gambar bukti transaksi...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/uploads/transaction-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Upload gambar gagal');
      }

      setImageUrl(data?.url ?? null);
      setImagePath(data?.pathname ?? null);

      toast.success('Gambar berhasil diupload', {
        id: toastId,
        description: 'Bukti transaksi siap disimpan.',
      });
    } catch (error) {
      toast.error('Upload gagal', {
        id: toastId,
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan saat upload gambar.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmountInput('');
    setAmountValue(0);
    setNote('');
    setCategoryId('');
    setTransactionAt(getNowLocalISOString());
    setAutoTime(true);
    setImageUrl(null);
    setImagePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Judul transaksi wajib diisi');
      return;
    }

    if (!amountValue || amountValue <= 0) {
      toast.error('Nominal harus lebih dari 0');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Menyimpan transaksi...');

    try {
      const parsedDate = new Date(transactionAt);

      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error('Tanggal transaksi tidak valid');
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          amount: amountValue,
          note: note.trim(),
          categoryId: categoryId || null,
          transactionAt: parsedDate.toISOString(),
          imageUrl,
          imagePath,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error?.formErrors?.[0] ||
            data?.error ||
            'Gagal menyimpan transaksi'
        );
      }

      resetForm();

      await onCreated?.();
      router.refresh();

      toast.success('Transaksi berhasil disimpan', {
        id: toastId,
        description:
          type === 'income'
            ? 'Pemasukan sudah masuk ke daftar transaksi.'
            : 'Pengeluaran sudah masuk ke daftar transaksi.',
      });
    } catch (error) {
      toast.error('Gagal menyimpan transaksi', {
        id: toastId,
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan transaksi.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-5 lg:p-6"
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
          Tambah Transaksi
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Catat pemasukan atau pengeluaran beserta foto bukti transaksi.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TxType)}
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul transaksi"
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                    required
                />
            </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="">Pilih kategori</option>
            {filteredCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="datetime-local"
            value={transactionAt}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          />

          <label className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 px-4 text-sm text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">
            <div className="flex min-w-0 items-center gap-2">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <UploadCloud className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">
                {uploading ? 'Mengupload gambar...' : 'Upload foto bukti transaksi'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <input
            id="auto-time"
            type="checkbox"
            checked={autoTime}
            onChange={(e) => setAutoTime(e.target.checked)}
            className="mt-1 shrink-0"
          />
          <label htmlFor="auto-time" className="leading-5">
            Update tanggal & jam otomatis real-time
          </label>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan tambahan"
          rows={4}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
        />

        {imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <ImageIcon className="h-4 w-4" />
              <span>Preview bukti transaksi</span>
            </div>

            <img
              src={imageUrl}
              alt="Preview bukti transaksi"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-sm font-medium text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Transaksi'
          )}
        </button>
      </div>
    </form>
  );
}