'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell } from '@/components/auth/auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Masuk ke akun kamu untuk melihat dashboard, transaksi, dan laporan yang hanya milik akun tersebut."
      footer={
        <p className="text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Buat akun sekarang
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]">
            <Mail className="mr-3 h-5 w-5 text-slate-400 transition group-focus-within:text-blue-600" />
            <input
              type="email"
              placeholder="nama@email.com"
              className="h-full w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]">
            <Lock className="mr-3 h-5 w-5 text-slate-400 transition group-focus-within:text-blue-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              className="h-full w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="ml-3 text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(37,99,235,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_38px_rgba(37,99,235,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk ke Dashboard'
          )}
        </button>
      </form>
    </AuthShell>
  );
}