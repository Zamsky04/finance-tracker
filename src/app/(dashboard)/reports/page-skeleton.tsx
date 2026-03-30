import { Skeleton } from '@/components/ui/skeleton';

export function ReportsPageSkeleton() {
  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-5 shadow-sm sm:p-6">
        <Skeleton className="h-3 w-28 bg-white/70" />
        <Skeleton className="mt-3 h-8 w-56 bg-white/80" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/70" />
      </section>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-56" />
      </div>

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

      <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
          <Skeleton className="mt-6 h-[340px] w-full rounded-2xl" />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
          <Skeleton className="mt-6 h-[340px] w-full rounded-2xl" />
        </div>
      </section>
    </main>
  );
}