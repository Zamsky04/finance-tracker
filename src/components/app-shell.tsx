'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChartColumn,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  UserCircle2,
  Wallet,
} from 'lucide-react';

const menus = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ReceiptText },
  { href: '/reports', label: 'Laporan', icon: ChartColumn },
];

type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(' ').filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 1).toUpperCase();
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AppUser;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(
    () => user.name?.trim() || user.email?.split('@')[0] || 'User',
    [user.name, user.email]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
      setProfileOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto flex max-w-7xl items-start gap-5 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-64 shrink-0 self-start overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_40px_-8px_rgba(30,64,175,0.1)] lg:block">
          <div className="mb-7 flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)]">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Finance App
              </h2>
              <p className="text-[11px] text-slate-400">Premium Tracker</p>
            </div>
          </div>

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Menu
          </p>

          <nav className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                      active
                        ? 'bg-white/20'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-4">
            <p className="text-xs font-semibold text-blue-700">Tips keuangan</p>
            <p className="mt-1 text-[11px] leading-relaxed text-blue-500">
              Catat setiap transaksi agar keuanganmu tetap terkontrol.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <div className="mb-5 flex items-center justify-between gap-4 overflow-visible rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Sistem Pencatatan
              </p>
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Pemasukan &amp; Pengeluaran
              </h1>
            </div>

            <div className="relative shrink-0" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-2 transition hover:border-blue-200 hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
                  <UserCircle2 size={20} />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-[140px] truncate text-sm font-semibold text-slate-800">
                    {displayName}
                  </p>
                  <p className="max-w-[140px] truncate text-xs text-slate-400">
                    {user.email || 'Akun aktif'}
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-400 transition sm:block ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.2)]">
                  <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                        <UserCircle2 size={24} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email || 'Akun pengguna'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600">
                      <UserCircle2 className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{displayName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? 'Sedang logout...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white/95 px-3 py-2 shadow-[0_-8px_24px_-4px_rgba(15,23,42,0.07)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5">
          {menus.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[10px] font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}