// src/components/transaction-form.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getNowLocalISOString } from '@/lib/date';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TxType = 'income' | 'expense';
type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cash';

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

const bankOptions = [
  { value: 'bca', label: 'BCA' },
  { value: 'bri', label: 'BRI' },
  { value: 'mandiri', label: 'Mandiri' },
  { value: 'bni', label: 'BNI' },
  { value: 'seabank', label: 'SeaBank' },
  { value: 'cimb_niaga', label: 'CIMB Niaga' },
  { value: 'permata', label: 'Permata' },
  { value: 'btn', label: 'BTN' },
  { value: 'danamon', label: 'Danamon' },
  { value: 'bsi', label: 'BSI' },
];

const eWalletOptions = [
  { value: 'gopay', label: 'GoPay' },
  { value: 'ovo', label: 'OVO' },
  { value: 'shopeepay', label: 'ShopeePay' },
  { value: 'dana', label: 'DANA' },
  { value: 'linkaja', label: 'LinkAja' },
];

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paymentProvider, setPaymentProvider] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransactionAt(getNowLocalISOString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((item) => item.type === type),
    [categories, type]
  );

  const paymentProviderOptions = useMemo(() => {
    if (paymentMethod === 'bank_transfer') return bankOptions;
    if (paymentMethod === 'e_wallet') return eWalletOptions;
    return [];
  }, [paymentMethod]);

  const handleTypeChange = (value: TxType) => {
    setType(value);
    setCategoryId('');
    setTransactionAt(getNowLocalISOString());
  };

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value);
    setPaymentProvider('');
  };

  const handleAmountChange = (value: string) => {
    const digits = digitsOnly(value);
    setAmountInput(formatRupiahInput(digits));
    setAmountValue(digits ? Number(digits) : 0);
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
      if (!res.ok) throw new Error(data?.error || 'Upload gambar gagal');

      setImageUrl(data?.url ?? null);
      setImagePath(data?.pathname ?? null);

      toast.success('Gambar berhasil diupload', {
        id: toastId,
        description: 'Bukti transaksi siap disimpan.',
      });
    } catch (error) {
      toast.error('Upload gambar gagal', {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat upload gambar.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmountInput('');
    setAmountValue(0);
    setNote('');
    setCategoryId('');
    setTransactionAt(getNowLocalISOString());
    setPaymentMethod('');
    setPaymentProvider('');
    setImageUrl(null);
    setImagePath(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

    if (!paymentMethod) {
      toast.error('Metode pembayaran wajib dipilih');
      return;
    }

    if (
      (paymentMethod === 'bank_transfer' || paymentMethod === 'e_wallet') &&
      !paymentProvider
    ) {
      toast.error('Provider pembayaran wajib dipilih');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          amount: amountValue,
          note: note.trim(),
          categoryId: categoryId || null,
          transactionAt: parsedDate.toISOString(),
          paymentMethod,
          paymentProvider: paymentMethod === 'cash' ? null : paymentProvider || null,
          imageUrl,
          imagePath,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error?.formErrors?.[0] ||
            data?.error?.fieldErrors?.paymentProvider?.[0] ||
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
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menyimpan transaksi.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none ring-0 transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(30,64,175,0.12)]"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          Tambah Transaksi
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Catat pemasukan atau pengeluaran beserta foto bukti transaksi.
        </p>
      </div>

      <div className="grid gap-4 p-6">
        <div className="flex rounded-2xl bg-slate-100 p-1">
          {(['expense', 'income'] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                type === t
                  ? t === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'bg-white text-rose-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul transaksi"
          className={inputClass}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              IDR
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className={`${inputClass} pl-12`}
              required
            />
          </div>

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 text-sm text-slate-900 shadow-none focus:ring-2 focus:ring-blue-100">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">
                  Belum ada kategori
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            value={paymentMethod}
            onValueChange={(value) => handlePaymentMethodChange(value as PaymentMethod)}
          >
            <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 text-sm text-slate-900 shadow-none focus:ring-2 focus:ring-blue-100">
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
              <SelectItem value="e_wallet">E-Wallet</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={paymentProvider}
            onValueChange={setPaymentProvider}
            disabled={!paymentMethod || paymentMethod === 'cash'}
          >
            <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 text-sm text-slate-900 shadow-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60">
              <SelectValue
                placeholder={
                  !paymentMethod
                    ? 'Pilih metode dulu'
                    : paymentMethod === 'cash'
                    ? 'Cash tidak butuh provider'
                    : 'Pilih provider'
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {paymentMethod === 'cash' ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  Cash tidak memiliki provider
                </div>
              ) : paymentProviderOptions.length > 0 ? (
                paymentProviderOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">
                  Belum ada pilihan
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <label
          className={`flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-sm transition-all duration-200 ${
            imageUrl
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-dashed border-slate-200 bg-slate-50/80 text-slate-500 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            {uploading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : imageUrl ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <UploadCloud className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-xs font-medium">
              {uploading
                ? 'Mengupload...'
                : imageUrl
                ? 'Foto terupload'
                : 'Upload bukti transaksi'}
            </span>
          </div>

          {imageUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setImageUrl(null);
                setImagePath(null);
              }}
              className="shrink-0 rounded-full p-0.5 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

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

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          rows={3}
          className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        {imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Preview bukti transaksi
              </div>
            </div>
            <img
              src={imageUrl}
              alt="Preview bukti transaksi"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_6px_24px_-4px_rgba(37,99,235,0.6)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
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