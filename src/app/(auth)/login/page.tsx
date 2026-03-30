'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Home,
  LogIn,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SocialProvider = 'google' | 'facebook';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.2H12Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.9c0-.5-.1-.9-.1-1.2H12v3.9h5.4c-.3 1.3-1.5 3.9-5.4 3.9v2.4h0c5 0 9.1-4.1 9.1-9Z"
      />
      <path
        fill="#FBBC05"
        d="M6 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.6H3.5A9.4 9.4 0 0 0 2.5 12c0 1.5.4 2.9 1 4.2L6 14Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-1.9 1-3.4 1-2.5 0-4.7-1.7-5.5-4l-3 2.3c1.6 3.2 4.9 5.6 9.1 5.6Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5H14v8.4C19.6 23.1 24 18.1 24 12.1Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);

  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  async function onSocialLogin(provider: SocialProvider) {
    try {
      setError('');
      setSocialLoading(provider);

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/callback?next=/dashboard`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        setError(error.message);
        setSocialLoading(null);
      }
    } catch (err) {
      setSocialLoading(null);
      setError(err instanceof Error ? err.message : 'Gagal memulai login sosial.');
    }
  }

  const emailFieldClass = [
    'relative flex h-13 items-center rounded-2xl border bg-slate-50 transition-all duration-200',
    focusedField === 'email'
      ? 'border-blue-600 bg-white ring-4 ring-blue-600/10'
      : 'border-slate-200',
    error ? 'border-red-500 ring-4 ring-red-500/8' : '',
  ].join(' ');

  const passwordFieldClass = [
    'relative flex h-13 items-center rounded-2xl border bg-slate-50 transition-all duration-200',
    focusedField === 'password'
      ? 'border-blue-600 bg-white ring-4 ring-blue-600/10'
      : 'border-slate-200',
    error ? 'border-red-500 ring-4 ring-red-500/8' : '',
  ].join(' ');

  const socialIconBtn =
    'flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-8 font-sans">
      <div className="pointer-events-none absolute -right-52 -top-52 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.06)_0%,transparent_70%)]" />

      <div className="relative w-full max-w-[460px] animate-[slideUp_.5s_cubic-bezier(0.22,1,0.36,1)_both] rounded-[28px] border border-black/7 bg-white px-12 pb-12 pt-13 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_20px_60px_rgba(37,99,235,0.08)] max-[480px]:rounded-3xl max-[480px]:px-7 max-[480px]:pb-9 max-[480px]:pt-10">
        <div className="absolute left-[10%] right-[10%] top-0 h-0.5 rounded-b-sm bg-linear-to-r from-transparent via-blue-600 to-transparent" />

        <div className="mb-9 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-blue-700 to-sky-400 text-white">
            <Home className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
            Login
          </span>
        </div>

        <h1 className="mb-2 font-serif text-4xl leading-none font-normal tracking-[-0.02em] text-slate-900 max-[480px]:text-3xl">
          Selamat <em className="text-blue-600 italic">datang</em>
          <br />
          kembali.
        </h1>

        <p className="mb-8 text-sm leading-6 text-slate-500">
          Masuk untuk mengakses dashboard, transaksi, dan laporan Anda.
        </p>

        <form onSubmit={onSubmit} className="space-y-[18px]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-600">
              Email
            </label>
            <div className={emailFieldClass}>
              <input
                className="h-full w-full bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-300"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-600">
              Password
            </label>
            <div className={passwordFieldClass}>
              <input
                className="h-full flex-1 bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-300"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="flex h-full items-center px-3.5 text-slate-400 transition-colors hover:text-slate-600"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
              <div className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-[13px] leading-5 text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="relative mt-2 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border-0 bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 text-[15px] font-semibold tracking-[0.01em] text-white shadow-[0_1px_2px_rgba(29,78,216,0.2),0_8px_24px_rgba(29,78,216,0.28)] transition-all duration-200 before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-white/12 before:to-transparent hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_2px_4px_rgba(29,78,216,0.2),0_12px_32px_rgba(29,78,216,0.34)] active:not-disabled:translate-y-0 active:not-disabled:shadow-[0_1px_2px_rgba(29,78,216,0.2),0_4px_12px_rgba(29,78,216,0.22)] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Masuk ke Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-7">
          <p className="text-center text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            atau login dengan
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onSocialLogin('google')}
              disabled={loading || socialLoading !== null}
              className={socialIconBtn}
              aria-label="Login dengan Google"
              title="Login dengan Google"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSocialLogin('facebook')}
              disabled={loading || socialLoading !== null}
              className={socialIconBtn}
              aria-label="Login dengan Facebook"
              title="Login dengan Facebook"
            >
              {socialLoading === 'facebook' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FacebookIcon />
              )}
            </button>
          </div>
        </div>

        <div className="my-6 flex items-center gap-3.5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="whitespace-nowrap text-xs text-slate-400">
            Belum punya akun?
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-center text-sm text-slate-500">
          <Link
            href="/register"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Buat akun sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}