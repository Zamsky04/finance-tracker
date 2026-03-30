import { Skeleton } from '@/components/ui/skeleton';

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-5 shadow-sm sm:p-6">
      <Skeleton className="h-3 w-28 bg-white/70" />
      <Skeleton className="mt-3 h-8 w-64 bg-white/80" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/70" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-xl bg-white/60" />
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-20" />
        </div>
      ))}
    </section>
  );
}

function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className={`mt-6 w-full rounded-2xl ${tall ? 'h-[340px]' : 'h-[300px]'}`} />
    </div>
  );
}

function TransactionFormSkeleton() {
  return (
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
  );
}

function TransactionListSkeleton() {
  return (
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
  );
}

export default function DashboardSegmentLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:space-y-6 md:px-6">
        <HeroSkeleton />
        <KpiSkeleton />
        <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <ChartSkeleton tall />
          <ChartSkeleton tall />
        </section>
        <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr] xl:gap-6">
          <TransactionFormSkeleton />
          <TransactionListSkeleton />
        </section>
      </div>
    </main>
  );
}