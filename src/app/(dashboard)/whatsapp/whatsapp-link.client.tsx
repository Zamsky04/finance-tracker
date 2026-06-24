'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Loader2, MessageCircle, RefreshCw, Unlink } from 'lucide-react';
import { toast } from 'sonner';

type LinkStatus = {
  linked: boolean;
  account: {
    id: string;
    phoneNumber: string;
    displayName?: string | null;
    isActive: boolean;
    linkedAt: number;
  } | null;
};

type LinkToken = {
  token: string;
  expiresAt: number;
  expiresInSeconds: number;
  botNumber?: string;
  waLink?: string | null;
};

function formatPhone(phone?: string | null) {
  if (!phone) return '-';
  if (phone.startsWith('62')) return `+${phone}`;
  return phone;
}

function formatDate(value?: number | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function WhatsappLinkClient() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [token, setToken] = useState<LinkToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [now, setNow] = useState(Date.now());

  const secondsLeft = useMemo(() => {
    if (!token) return 0;
    return Math.max(0, Math.floor((token.expiresAt - now) / 1000));
  }, [token, now]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/link/status', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal mengambil status WhatsApp');
      setStatus(data);
    } catch (error) {
      toast.error('Gagal mengambil status WhatsApp', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      void loadStatus();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const generateToken = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/whatsapp/link/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal membuat kode WhatsApp');
      setToken(data);
      toast.success('Kode WhatsApp berhasil dibuat');
    } catch (error) {
      toast.error('Gagal membuat kode WhatsApp', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = async () => {
    if (!token?.token) return;
    await navigator.clipboard.writeText(token.token);
    toast.success('Kode berhasil disalin');
  };

  const unlinkWhatsapp = async () => {
    const ok = window.confirm('Putuskan koneksi WhatsApp dari akun ini?');
    if (!ok) return;

    setUnlinking(true);
    try {
      const res = await fetch('/api/whatsapp/link/unlink', { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Gagal memutus koneksi WhatsApp');
      setToken(null);
      await loadStatus();
      toast.success('WhatsApp berhasil diputuskan');
    } catch (error) {
      toast.error('Gagal memutus koneksi WhatsApp', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-cyan-700 p-5 text-white shadow-[0_8px_40px_-8px_rgba(15,23,42,0.4)] sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-12 right-14 h-52 w-52 rounded-full bg-white/5" />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                Integrasi WhatsApp
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
                Catat transaksi dari bot WA
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50 md:text-base">
                Hubungkan nomor WhatsApp, lalu kirim nominal atau foto struk agar transaksi otomatis masuk ke dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Status koneksi</h2>
                <p className="text-xs text-slate-500">Nomor WA yang terhubung ke akun ini.</p>
              </div>
              <button
                type="button"
                onClick={loadStatus}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </button>
            </div>

            {status?.linked ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  WhatsApp aktif
                </div>
                <div className="mt-3 space-y-2 text-sm text-emerald-900">
                  <p><span className="font-medium">Nomor:</span> {formatPhone(status.account?.phoneNumber)}</p>
                  <p><span className="font-medium">Nama:</span> {status.account?.displayName || '-'}</p>
                  <p><span className="font-medium">Terhubung:</span> {formatDate(status.account?.linkedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={unlinkWhatsapp}
                  disabled={unlinking}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-60"
                >
                  {unlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                  Putuskan koneksi
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                WhatsApp belum terhubung. Buat kode, lalu kirim kode tersebut ke bot WhatsApp.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Hubungkan WhatsApp</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Kode hanya berlaku 10 menit. Setelah kode dikirim ke bot, sistem otomatis menghubungkan nomor WA ke akun Google yang sedang login.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateToken}
                disabled={generating}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)] transition hover:brightness-105 disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                Generate kode
              </button>

              {token?.waLink && (
                <a
                  href={token.waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Buka WhatsApp
                </a>
              )}
            </div>

            {token && (
              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Kode linking</p>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                  <code className="text-xl font-bold tracking-widest text-slate-900">{token.token}</code>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-blue-700">
                  Sisa waktu: <span className="font-semibold">{secondsLeft}</span> detik
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Kirim kode ini ke bot WhatsApp. Setelah berhasil, halaman ini akan memperbarui status otomatis.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Format penggunaan bot</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">1. Pilih jenis</p>
              <p className="mt-1 text-xs leading-relaxed">Klik Pengeluaran atau Pemasukan dari tombol WhatsApp.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">2. Kirim data</p>
              <p className="mt-1 text-xs leading-relaxed">Kirim nominal manual, misalnya 25000, atau kirim foto struk.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">3. Konfirmasi</p>
              <p className="mt-1 text-xs leading-relaxed">Bot membaca struk, menampilkan detail, lalu kamu klik Simpan.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
