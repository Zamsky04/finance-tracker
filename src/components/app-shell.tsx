'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartColumn,
  LayoutDashboard,
  ReceiptText,
  Wallet,
} from 'lucide-react';

const menus = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ReceiptText },
  { href: '/reports', label: 'Laporan', icon: ChartColumn },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto flex max-w-7xl items-start gap-5 px-3 py-4 sm:px-4 sm:py-6 md:px-6">

        {/* Sidebar */}
        <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-64 shrink-0 self-start overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_40px_-8px_rgba(30,64,175,0.1)] lg:block">

          {/* Logo */}
          <div className="mb-7 flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)]">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">Finance App</h2>
              <p className="text-[11px] text-slate-400">Premium Tracker</p>
            </div>
          </div>

          {/* Nav label */}
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Menu
          </p>

          <nav className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                      active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom divider decoration */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-4">
            <p className="text-xs font-semibold text-blue-700">Tips keuangan</p>
            <p className="mt-1 text-[11px] leading-relaxed text-blue-500">
              Catat setiap transaksi agar keuanganmu tetap terkontrol.
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 pb-24 lg:pb-0">

          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Sistem Pencatatan
              </p>
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Pemasukan &amp; Pengeluaran
              </h1>
            </div>
            {/* Avatar placeholder — swap for real user avatar if available */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-sm">
              F
            </div>
          </div>

          {children}
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white/95 px-3 py-2 shadow-[0_-8px_24px_-4px_rgba(15,23,42,0.07)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5">
          {menus.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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