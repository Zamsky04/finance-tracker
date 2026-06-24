import crypto from 'crypto';
import { parseWhatsappMessages } from '@/lib/whatsapp/payload';
import { processWhatsappMessage } from '@/lib/whatsapp/handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function verifySignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) return true;
  if (!signatureHeader?.startsWith('sha256=')) return false;

  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers.get('x-hub-signature-256'))) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody || '{}') as Record<string, unknown>;
  const messages = parseWhatsappMessages(payload);

  for (const message of messages) {
    await processWhatsappMessage(message, payload).catch((error) => {
      console.error('WhatsApp webhook process error:', error);
    });
  }

  return Response.json({ ok: true });
}
