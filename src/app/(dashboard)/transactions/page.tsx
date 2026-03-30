// src/app/(dashboard)/transactions/page.tsx
import { getCategories } from '@/db/queries';
import { getTransactionsData } from '@/db/dashboard-queries';
import { requireUser } from '@/lib/auth';
import { TransactionsClient } from './transactions.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TransactionsPage() {
  const user = await requireUser();

  const [transactions, categories] = await Promise.all([
    getTransactionsData(user.id),
    getCategories(user.id),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions}
      categories={categories}
    />
  );
}