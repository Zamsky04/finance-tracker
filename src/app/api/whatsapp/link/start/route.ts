import { db } from '@/db';
import { whatsappLinkTokens } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createLinkToken, hashLinkToken, nowMs } from '@/lib/whatsapp/utils';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = createLinkToken();
  const expiresAt = nowMs() + 10 * 60 * 1000;

  await db.insert(whatsappLinkTokens).values({
    userId: user.id,
    tokenHash: hashLinkToken(token),
    expiresAt,
  });

  const botNumber = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || '';
  const message = encodeURIComponent(token);
  const waLink = botNumber ? `https://wa.me/${botNumber.replace(/\D/g, '')}?text=${message}` : null;

  return Response.json({
    token,
    expiresAt,
    expiresInSeconds: 600,
    botNumber,
    waLink,
  });
}
