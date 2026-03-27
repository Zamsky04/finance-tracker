import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { transactionSchema } from '@/lib/validations';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: Context) {
  const { id } = await context.params;

  const [row] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);

  if (!row) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json(row);
}

export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params;
  const body = await req.json();

  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(transactions)
    .set({
      type: parsed.data.type,
      title: parsed.data.title,
      amount: String(parsed.data.amount),
      note: parsed.data.note || null,
      categoryId: parsed.data.categoryId || null,
      transactionAt: new Date(parsed.data.transactionAt),
      imageUrl: parsed.data.imageUrl || null,
      imagePath: parsed.data.imagePath || null,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(_req: Request, context: Context) {
  const { id } = await context.params;

  const [deleted] = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();

  if (!deleted) {
    return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  return Response.json({ ok: true });
}