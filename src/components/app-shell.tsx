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
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/transactions',
    label: 'Transaksi',
    icon: ReceiptText,
  },
  {
    href: '/reports',
    label: 'Laporan',
    icon: ChartColumn,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="mx-auto flex max-w-7xl items-start gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-6 md:px-6">
        <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-72 shrink-0 self-start overflow-y-auto rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-2xl backdrop-blur lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
              <Wallet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Finance App</h2>
              <p className="text-sm text-slate-500">Premium Tracker</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <div className="mb-4 rounded-[24px] border border-white/60 bg-white/80 px-4 py-4 shadow-xl backdrop-blur sm:mb-6 sm:rounded-[28px] sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Sistem Pencatatan Keuangan</p>
                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  Pemasukan & Pengeluaran
                </h1>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {menus.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition sm:text-xs ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}