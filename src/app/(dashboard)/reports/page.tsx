import { Suspense } from 'react';
import { requireUser } from '@/lib/auth';
import { ReportsPageContent } from './page-content';
import { ReportsPageSkeleton } from './page-skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportsPage() {
  const user = await requireUser();

  return (
    <Suspense fallback={<ReportsPageSkeleton />}>
      <ReportsPageContent userId={user.id} />
    </Suspense>
  );
}