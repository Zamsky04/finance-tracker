// src/app/api/transactions/route.ts
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { transactionSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const type = searchParams.get('type');

  const conditions = [eq(transactions.userId, user.id)];

  if (from) {
    conditions.push(gte(transactions.transactionAt, new Date(from).getTime()));
  }

  if (to) {
    conditions.push(lte(transactions.transactionAt, new Date(to).getTime()));
  }

  if (type === 'income' || type === 'expense') {
    conditions.push(eq(transactions.type, type));
  }

  const rows = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
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
        eq(categories.userId, user.id)
      )
    )
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionAt), desc(transactions.id));

  return Response.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const category = await db
      .select({
        id: categories.id,
      })
      .from(categories)
      .where(
        and(
          eq(categories.id, parsed.data.categoryId),
          eq(categories.userId, user.id)
        )
      )
      .limit(1);

    if (category.length === 0) {
      return Response.json(
        { error: 'Kategori tidak ditemukan atau bukan milik user ini.' },
        { status: 400 }
      );
    }
  }

  const [created] = await db
    .insert(transactions)
    .values({
      userId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      amount: String(parsed.data.amount),
      note: parsed.data.note || null,
      categoryId: parsed.data.categoryId || null,
      transactionAt: new Date(parsed.data.transactionAt).getTime(),
      paymentMethod: parsed.data.paymentMethod || null,
      paymentProvider:
        parsed.data.paymentMethod === 'cash'
          ? null
          : parsed.data.paymentProvider || null,
      imageUrl: parsed.data.imageUrl || null,
      imagePath: parsed.data.imagePath || null,
    })
    .returning();

  return Response.json(created, { status: 201 });
}