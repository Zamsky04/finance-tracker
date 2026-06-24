// src/lib/whatsapp/utils.ts
import crypto from 'crypto';

export function normalizePhoneNumber(value?: string | null) {
  return (value || '').replace(/\D/g, '');
}

export function hashLinkToken(token: string) {
  const pepper = process.env.WHATSAPP_LINK_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'finance-whatsapp-link';
  return crypto.createHmac('sha256', pepper).update(token.trim().toUpperCase()).digest('hex');
}

export function createLinkToken() {
  const code = crypto.randomInt(100000, 999999).toString();
  return `FIN-${code}`;
}

export function nowMs() {
  return Date.now();
}

export function formatIDR(value: number | string | null | undefined) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export function extractAmount(text: string) {
  const normalized = text
    .replace(/rp/gi, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  const match = normalized.match(/(?:^|\D)(\d{1,3}(?:[. ]\d{3})+|\d+)(?:\D|$)/);
  if (!match) return null;

  const amount = Number(match[1].replace(/\D/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function normalizeText(value?: string | null) {
  return (value || '').trim().toLowerCase();
}
