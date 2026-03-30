import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { transactionSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .limit(1);

  if (!row) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json(row);
}

export async function PATCH(req: Request, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const category = await db
      .select({ id: categories.id })
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

  const [updated] = await db
    .update(transactions)
    .set({
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
      updatedAt: Date.now(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning();

  if (!updated) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(_req: Request, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning();

  if (!deleted) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json({ ok: true });
}