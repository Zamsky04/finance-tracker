import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { whatsappAccounts } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db
    .update(whatsappAccounts)
    .set({ isActive: false })
    .where(and(eq(whatsappAccounts.userId, user.id), eq(whatsappAccounts.isActive, true)));

  return Response.json({ ok: true });
}
