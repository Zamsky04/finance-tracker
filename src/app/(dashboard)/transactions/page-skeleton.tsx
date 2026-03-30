import { Skeleton } from '@/components/ui/skeleton';

export function TransactionsPageSkeleton() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-5 shadow-sm sm:p-6">
          <Skeleton className="h-3 w-32 bg-white/70" />
          <Skeleton className="mt-3 h-8 w-56 bg-white/80" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/70" />
        </section>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr] xl:gap-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-6 w-40" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-32" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-6 w-40" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-2 h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}