import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { whatsappAccounts } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      id: whatsappAccounts.id,
      phoneNumber: whatsappAccounts.phoneNumber,
      displayName: whatsappAccounts.displayName,
      isActive: whatsappAccounts.isActive,
      linkedAt: whatsappAccounts.linkedAt,
    })
    .from(whatsappAccounts)
    .where(eq(whatsappAccounts.userId, user.id))
    .orderBy(desc(whatsappAccounts.linkedAt))
    .limit(1);

  return Response.json({
    linked: Boolean(rows[0]?.isActive),
    account: rows[0] || null,
  });
}
