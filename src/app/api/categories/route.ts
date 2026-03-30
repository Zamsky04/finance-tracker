import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  const conditions = [eq(categories.userId, user.id)];

  if (type === 'income' || type === 'expense') {
    conditions.push(eq(categories.type, type));
  }

  const rows = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(asc(categories.type), asc(categories.name));

  return Response.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const name = String(body.name ?? '').trim();
  const type = body.type;

  if (!name) {
    return Response.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }

  if (type !== 'income' && type !== 'expense') {
    return Response.json(
      { error: 'Tipe kategori harus income atau expense.' },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(categories)
    .values({
      userId: user.id,
      name,
      type,
      color: body.color ? String(body.color) : null,
      icon: body.icon ? String(body.icon) : null,
    })
    .returning();

  return Response.json(created, { status: 201 });
}