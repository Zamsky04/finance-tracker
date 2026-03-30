import { Skeleton } from '@/components/ui/skeleton';

export function DashboardPageSkeleton() {
  return (
    <>
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

      <section className="grid gap-4 lg:grid-cols-1 lg:gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
          <Skeleton className="mt-6 h-[320px] w-full rounded-2xl" />
        </div>
      </section>
    </>
  );
}