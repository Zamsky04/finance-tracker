import { Suspense } from 'react';
import { requireUser } from '@/lib/auth';
import { TransactionsPageContent } from './page-content';
import { TransactionsPageSkeleton } from './page-skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TransactionsPage() {
  const user = await requireUser();

  return (
    <Suspense fallback={<TransactionsPageSkeleton />}>
      <TransactionsPageContent userId={user.id} />
    </Suspense>
  );
}