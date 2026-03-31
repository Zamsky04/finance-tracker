// src/db/dashboard-queries.ts
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';

export type TxType = 'income' | 'expense';
export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cash';

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

export type CashflowTrendData = {
  date: string;
  income: number;
  expense: number;
};

export type TransactionData = {
  id: string;
  type: TxType;
  title: string;
  amount: number;
  note: string | null;
  transactionAt: number;
  paymentMethod: PaymentMethod | null;
  paymentProvider: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

export type DateRangeParams = {
  from?: string;
  to?: string;
};

function toNumber(value: string | number | null | undefined) {
  if (value == null) return 0;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toMillis(value?: string) {
  if (!value) return undefined;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : undefined;
}

function buildTransactionWhere(userId: string, range?: DateRangeParams) {
  const conditions = [eq(transactions.userId, userId)];

  const fromMs = toMillis(range?.from);
  const toMs = toMillis(range?.to);

  if (fromMs !== undefined) {
    conditions.push(gte(transactions.transactionAt, fromMs));
  }

  if (toMs !== undefined) {
    conditions.push(lte(transactions.transactionAt, toMs));
  }

  return and(...conditions);
}

export async function getCashflowTrendData(
  userId: string,
  range?: DateRangeParams
): Promise<CashflowTrendData[]> {
  const rows = await db
    .select({
      type: transactions.type,
      amount: transactions.amount,
      transactionAt: transactions.transactionAt,
    })
    .from(transactions)
    .where(buildTransactionWhere(userId, range))
    .orderBy(desc(transactions.transactionAt));

  const grouped = new Map<string, CashflowTrendData>();

  for (const item of rows) {
    const amount = toNumber(item.amount);
    const dateKey = new Date(Number(item.transactionAt)).toISOString().slice(0, 10);

    const existing = grouped.get(dateKey);

    if (existing) {
      if (item.type === 'income') {
        existing.income += amount;
      } else {
        existing.expense += amount;
      }
    } else {
      grouped.set(dateKey, {
        date: dateKey,
        income: item.type === 'income' ? amount : 0,
        expense: item.type === 'expense' ? amount : 0,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export async function getSummaryData(
  userId: string,
  range?: DateRangeParams
): Promise<SummaryData> {
  const rows = await db
    .select({
      type: transactions.type,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(buildTransactionWhere(userId, range));

  return rows.reduce<SummaryData>(
    (acc, item) => {
      const amount = toNumber(item.amount);

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
    }
  );
}

export async function getExpenseBreakdownData(
  userId: string,
  range?: DateRangeParams
): Promise<ExpenseBreakdownData[]> {
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, 'expense' as TxType),
  ];

  const fromMs = toMillis(range?.from);
  const toMs = toMillis(range?.to);

  if (fromMs !== undefined) {
    conditions.push(gte(transactions.transactionAt, fromMs));
  }

  if (toMs !== undefined) {
    conditions.push(lte(transactions.transactionAt, toMs));
  }

  const expenseOnly = await db
    .select({
      amount: transactions.amount,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(
      categories,
      and(
        eq(transactions.categoryId, categories.id),
        eq(categories.userId, userId)
      )
    )
    .where(and(...conditions));

  const grouped = new Map<string, ExpenseBreakdownData>();
  let grandTotal = 0;

  for (const item of expenseOnly) {
    const amount = toNumber(item.amount);
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

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      percentage:
        grandTotal === 0
          ? 0
          : Number(((item.total / grandTotal) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getTransactionsData(
  userId: string,
  range?: DateRangeParams
): Promise<TransactionData[]> {
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      title: transactions.title,
      amount: transactions.amount,
      note: transactions.note,
      transactionAt: transactions.transactionAt,
      paymentMethod: transactions.paymentMethod,
      paymentProvider: transactions.paymentProvider,
      imageUrl: transactions.imageUrl,
      imagePath: transactions.imagePath,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(
      categories,
      and(
        eq(transactions.categoryId, categories.id),
        eq(categories.userId, userId)
      )
    )
    .where(buildTransactionWhere(userId, range))
    .orderBy(desc(transactions.transactionAt), desc(transactions.id));

  return rows.map((item) => ({
    id: String(item.id),
    type: item.type as TxType,
    title: item.title,
    amount: toNumber(item.amount),
    note: item.note,
    transactionAt: Number(item.transactionAt),
    paymentMethod: (item.paymentMethod ?? null) as PaymentMethod | null,
    paymentProvider: item.paymentProvider ?? null,
    imageUrl: item.imageUrl,
    imagePath: item.imagePath,
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryName: item.categoryName ?? null,
    categoryColor: item.categoryColor ?? null,
  }));
}