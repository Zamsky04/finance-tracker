// src/db/dashboard-queries.ts
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';

export type TxType = 'income' | 'expense';

export type SummaryData = {
  total_income: number;
  total_expense: number;
  balance: number;
};

export type ExpenseBreakdownData = {
  category: string;
  color: string;
  total: number;
  percentage: number;
};

export type TransactionData = {
  id: string;
  type: TxType;
  title: string;
  amount: number;
  note: string | null;
  transactionAt: Date;
  imageUrl: string | null;
  imagePath: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

export async function getSummaryData(): Promise<SummaryData> {
  const rows = await db.select().from(transactions);

  const summary = rows.reduce(
    (acc, item) => {
      const amount = Number(item.amount ?? 0);

      if (item.type === 'income') {
        acc.total_income += amount;
        acc.balance += amount;
      } else {
        acc.total_expense += amount;
        acc.balance -= amount;
      }

      return acc;
    },
    {
      total_income: 0,
      total_expense: 0,
      balance: 0,
    } satisfies SummaryData
  );

  return summary;
}

export async function getExpenseBreakdownData(): Promise<ExpenseBreakdownData[]> {
  const rows = await db
    .select({
      amount: transactions.amount,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id));

  const expenseRows = rows.filter((item) => item.amount != null);

  const grouped = new Map<string, ExpenseBreakdownData>();
  let grandTotal = 0;

  for (const item of expenseRows) {
    const tx = item as typeof item & { amount: string | number };
    const amount = Number(tx.amount ?? 0);

    const originalTx = rows.find(
      (r) =>
        r.amount === item.amount &&
        r.categoryName === item.categoryName &&
        r.categoryColor === item.categoryColor
    );

    if (!originalTx) continue;

    // filter hanya expense
    // karena select di atas tidak ambil type, maka lebih aman ambil ulang dari source lengkap
  }

  const expenseOnly = await db
    .select({
      amount: transactions.amount,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.type, 'expense'));

  for (const item of expenseOnly) {
    const amount = Number(item.amount ?? 0);
    const category = item.categoryName ?? 'Tanpa Kategori';
    const color = item.categoryColor ?? '#3b82f6';

    grandTotal += amount;

    const existing = grouped.get(category);

    if (existing) {
      existing.total += amount;
    } else {
      grouped.set(category, {
        category,
        color,
        total: amount,
        percentage: 0,
      });
    }
  }

  const result = Array.from(grouped.values())
    .map((item) => ({
      ...item,
      percentage: grandTotal === 0 ? 0 : Number(((item.total / grandTotal) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.total - a.total);

  return result;
}

export async function getTransactionsData(): Promise<TransactionData[]> {
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      title: transactions.title,
      amount: transactions.amount,
      note: transactions.note,
      transactionAt: transactions.transactionAt,
      imageUrl: transactions.imageUrl,
      imagePath: transactions.imagePath,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.transactionAt));

  return rows.map((item) => ({
    id: String(item.id),
    type: item.type as TxType,
    title: item.title,
    amount: Number(item.amount ?? 0),
    note: item.note,
    transactionAt: item.transactionAt,
    imageUrl: item.imageUrl,
    imagePath: item.imagePath,
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryName: item.categoryName ?? null,
    categoryColor: item.categoryColor ?? null,
  }));
}