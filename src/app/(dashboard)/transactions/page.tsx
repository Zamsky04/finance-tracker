import { getCategories } from '@/db/queries';
import { getTransactionsData } from '@/db/dashboard-queries';
import { TransactionsClient } from './transactions.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactionsData(),
    getCategories(),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions}
      categories={categories}
    />
  );
}