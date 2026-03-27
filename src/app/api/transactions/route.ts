// src/app/api/transactions/route.ts
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { transactionSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const type = searchParams.get('type');

  const conditions = [];

  if (from) {
    conditions.push(gte(transactions.transactionAt, new Date(from)));
  }

  if (to) {
    conditions.push(lte(transactions.transactionAt, new Date(to)));
  }

  if (type === 'income' || type === 'expense') {
    conditions.push(eq(transactions.type, type));
  }

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
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(transactions.transactionAt));

  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [created] = await db
    .insert(transactions)
    .values({
      type: parsed.data.type,
      title: parsed.data.title,
      amount: String(parsed.data.amount),
      note: parsed.data.note || null,
      categoryId: parsed.data.categoryId || null,
      transactionAt: new Date(parsed.data.transactionAt),
      imageUrl: parsed.data.imageUrl || null,
      imagePath: parsed.data.imagePath || null,
    })
    .returning();

  return Response.json(created, { status: 201 });
}