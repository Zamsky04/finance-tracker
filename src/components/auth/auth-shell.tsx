import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(147,197,253,0.16),transparent_32%),linear-gradient(to_bottom_right,#eff6ff,#dbeafe,#f8fafc)]" />
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.14),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide backdrop-blur">
                  Finance OS
                </div>
                <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
                  Kelola keuangan dengan tampilan yang lebih modern, aman, dan personal.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-blue-50/90">
                  Setiap akun memiliki data masing-masing. Login aman, dashboard rapi,
                  dan pengalaman penggunaan terasa lebih premium.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
                  <div className="text-sm text-blue-100">Keamanan data</div>
                  <div className="mt-2 text-xl font-semibold">Supabase Auth + PostgreSQL</div>
                  <div className="mt-2 text-sm leading-6 text-blue-50/90">
                    Session modern, struktur scalable, dan data terpisah per user.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
                    <div className="text-3xl font-semibold">100%</div>
                    <div className="mt-2 text-sm text-blue-50/90">
                      Data user terisolasi
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
                    <div className="text-3xl font-semibold">24/7</div>
                    <div className="mt-2 text-sm text-blue-50/90">
                      Akses dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-[720px] items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Secure Access
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>

              {children}

              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}