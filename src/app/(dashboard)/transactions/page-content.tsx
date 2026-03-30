import { getCategories } from '@/db/queries';
import { getTransactionsData } from '@/db/dashboard-queries';
import { TransactionsClient } from './transactions.client';

type Props = {
  userId: string;
};

export async function TransactionsPageContent({ userId }: Props) {
  const [transactions, categories] = await Promise.all([
    getTransactionsData(userId),
    getCategories(userId),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions}
      categories={categories}
    />
  );
}