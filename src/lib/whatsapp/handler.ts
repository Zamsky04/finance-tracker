// src/lib/whatsapp/handler.ts
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  categories,
  transactions,
  whatsappAccounts,
  whatsappConversations,
  whatsappInboundMessages,
  whatsappLinkTokens,
} from '@/db/schema';
import { parseReceiptImage, type ReceiptParseResult } from '@/lib/ocr/receipt-parser';
import { uploadTransactionImageFromBuffer } from '@/lib/storage/transaction-image';
import {
  downloadWhatsappMedia,
  sendWhatsappButtons,
  sendWhatsappText,
} from './client';
import type { ParsedWhatsappMessage } from './payload';
import {
  extractAmount,
  formatIDR,
  hashLinkToken,
  normalizePhoneNumber,
  normalizeText,
  nowMs,
} from './utils';

type TxType = 'income' | 'expense';

type ConversationPayload = {
  type?: TxType;
  draft?: DraftTransaction;
};

type DraftTransaction = {
  type: TxType;
  title: string;
  amount: number;
  note?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  transactionAtISO: string;
  paymentMethod: 'bank_transfer' | 'e_wallet' | 'cash';
  paymentProvider?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  externalMessageId?: string | null;
  ocrConfidence?: number | null;
  ocrRaw?: Record<string, unknown> | null;
};

function isStartIncome(text: string) {
  return ['income', 'pemasukan', 'masuk', '2', 'btn_income'].includes(text);
}

function isStartExpense(text: string) {
  return ['expense', 'pengeluaran', 'keluar', '1', 'btn_expense'].includes(text);
}

function isConfirm(text: string) {
  return ['ya', 'y', 'yes', 'simpan', '1', 'btn_save'].includes(text);
}

function isCancel(text: string) {
  return ['batal', 'cancel', '2', 'btn_cancel'].includes(text);
}

function getTypeLabel(type: TxType) {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran';
}

async function markInboundProcessed(message: ParsedWhatsappMessage, rawPayload: Record<string, unknown>) {
  const inserted = await db
    .insert(whatsappInboundMessages)
    .values({
      messageId: message.id,
      phoneNumber: normalizePhoneNumber(message.from),
      rawPayload,
    })
    .onConflictDoNothing({ target: whatsappInboundMessages.messageId })
    .returning({ messageId: whatsappInboundMessages.messageId });

  return inserted.length > 0;
}

async function sendMainMenu(to: string) {
  await sendWhatsappButtons({
    to,
    body:
      'Pilih jenis transaksi yang ingin dicatat. Setelah itu kamu bisa kirim nominal manual atau foto struk.',
    buttons: [
      { id: 'btn_expense', title: 'Pengeluaran' },
      { id: 'btn_income', title: 'Pemasukan' },
    ],
  });
}

async function sendNeedLink(to: string) {
  await sendWhatsappText(
    to,
    'Nomor WhatsApp ini belum terhubung. Silakan login di website Finance, buka menu WhatsApp, lalu generate kode dan kirim kode FIN-xxxxxx ke bot ini.'
  );
}

async function getLinkedAccount(phoneNumber: string) {
  const rows = await db
    .select()
    .from(whatsappAccounts)
    .where(
      and(
        eq(whatsappAccounts.phoneNumber, phoneNumber),
        eq(whatsappAccounts.isActive, true)
      )
    )
    .limit(1);

  return rows[0] || null;
}

async function getConversation(accountId: string) {
  const existing = await db
    .select()
    .from(whatsappConversations)
    .where(eq(whatsappConversations.whatsappAccountId, accountId))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(whatsappConversations)
    .values({
      whatsappAccountId: accountId,
      state: 'idle',
      payload: {},
    })
    .returning();

  return created;
}

async function updateConversation(
  accountId: string,
  state: string,
  payload: ConversationPayload = {}
) {
  const existing = await getConversation(accountId);

  const [updated] = await db
    .update(whatsappConversations)
    .set({
      state,
      payload,
      lastMessageAt: nowMs(),
    })
    .where(eq(whatsappConversations.id, existing.id))
    .returning();

  return updated;
}

async function clearConversation(accountId: string) {
  return updateConversation(accountId, 'idle', {});
}

async function tryLinkWhatsappAccount(message: ParsedWhatsappMessage) {
  const text = (message.text || '').trim().toUpperCase();
  const tokenMatch = text.match(/FIN[-\s]?\d{6}/i);

  if (!tokenMatch) return false;

  const digits = tokenMatch[0].replace(/\D/g, '');
  const token = `FIN-${digits}`;
  const tokenHash = hashLinkToken(token);
  const phoneNumber = normalizePhoneNumber(message.from);
  const now = nowMs();

  const activeToken = await db
    .select()
    .from(whatsappLinkTokens)
    .where(
      and(
        eq(whatsappLinkTokens.tokenHash, tokenHash),
        isNull(whatsappLinkTokens.usedAt),
        sql`${whatsappLinkTokens.expiresAt} > ${now}`
      )
    )
    .limit(1);

  const row = activeToken[0];
  if (!row) {
    await sendWhatsappText(
      message.from,
      'Kode tidak valid atau sudah expired. Silakan generate ulang kode dari menu WhatsApp di website.'
    );
    return true;
  }

  const existing = await db
    .select()
    .from(whatsappAccounts)
    .where(eq(whatsappAccounts.phoneNumber, phoneNumber))
    .limit(1);

  let accountId: string;
  if (existing[0]) {
    const [updated] = await db
      .update(whatsappAccounts)
      .set({
        userId: row.userId,
        waId: message.from,
        displayName: message.displayName || null,
        isActive: true,
        linkedAt: now,
      })
      .where(eq(whatsappAccounts.id, existing[0].id))
      .returning();
    accountId = updated.id;
  } else {
    const [created] = await db
      .insert(whatsappAccounts)
      .values({
        userId: row.userId,
        phoneNumber,
        waId: message.from,
        displayName: message.displayName || null,
        isActive: true,
        linkedAt: now,
      })
      .returning();
    accountId = created.id;
  }

  await db
    .update(whatsappLinkTokens)
    .set({ usedAt: now })
    .where(eq(whatsappLinkTokens.id, row.id));

  await updateConversation(accountId, 'idle', {});

  await sendWhatsappText(
    message.from,
    'Berhasil! WhatsApp kamu sudah terhubung ke akun Finance. Ketik menu untuk mulai mencatat transaksi.'
  );
  await sendMainMenu(message.from);

  return true;
}

async function findCategoryId(userId: string, type: TxType, categoryName?: string | null) {
  const name = categoryName?.trim() || 'Lainnya';

  const exact = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, type),
        sql`lower(${categories.name}) = lower(${name})`
      )
    )
    .limit(1);

  if (exact[0]) return exact[0];

  const fallback = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, type),
        sql`lower(${categories.name}) = 'lainnya'`
      )
    )
    .limit(1);

  return fallback[0] || null;
}

async function buildDraftFromReceipt({
  userId,
  type,
  receipt,
  imageUrl,
  imagePath,
  messageId,
}: {
  userId: string;
  type: TxType;
  receipt: ReceiptParseResult;
  imageUrl: string;
  imagePath: string;
  messageId: string;
}): Promise<DraftTransaction | null> {
  const amount = receipt.amount;
  if (!amount || amount <= 0) return null;

  const finalType = receipt.type || type;
  const category = await findCategoryId(userId, finalType, receipt.categoryName);
  const parsedDate = receipt.transactionAtISO ? new Date(receipt.transactionAtISO) : new Date();

  return {
    type: finalType,
    title: receipt.title || (finalType === 'income' ? 'Pemasukan dari WhatsApp' : 'Pengeluaran dari WhatsApp'),
    amount,
    note: receipt.note || `Dicatat otomatis dari WhatsApp. Confidence OCR: ${Math.round(receipt.confidence * 100)}%.`,
    categoryId: category?.id || null,
    categoryName: category?.name || receipt.categoryName || 'Lainnya',
    transactionAtISO: Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString(),
    paymentMethod: receipt.paymentMethod || 'cash',
    paymentProvider: receipt.paymentMethod === 'cash' ? null : receipt.paymentProvider || null,
    imageUrl,
    imagePath,
    externalMessageId: messageId,
    ocrConfidence: receipt.confidence,
    ocrRaw: receipt.raw || null,
  };
}

function buildConfirmationMessage(draft: DraftTransaction) {
  return [
    'Saya mendeteksi transaksi berikut:',
    '',
    `Jenis: ${getTypeLabel(draft.type)}`,
    `Nominal: ${formatIDR(draft.amount)}`,
    `Judul: ${draft.title}`,
    `Kategori: ${draft.categoryName || 'Lainnya'}`,
    `Metode: ${draft.paymentMethod === 'cash' ? 'Cash' : draft.paymentProvider || draft.paymentMethod}`,
    `Tanggal: ${new Date(draft.transactionAtISO).toLocaleString('id-ID')}`,
    '',
    'Simpan transaksi ini?',
  ].join('\n');
}

async function askConfirmation(to: string, accountId: string, draft: DraftTransaction) {
  await updateConversation(accountId, 'waiting_confirmation', { draft });
  await sendWhatsappButtons({
    to,
    body: buildConfirmationMessage(draft),
    buttons: [
      { id: 'btn_save', title: 'Simpan' },
      { id: 'btn_cancel', title: 'Batal' },
    ],
  });
}

async function saveDraft(userId: string, draft: DraftTransaction) {
  const [created] = await db
    .insert(transactions)
    .values({
      userId,
      type: draft.type,
      title: draft.title.slice(0, 180),
      amount: String(draft.amount),
      note: draft.note || null,
      categoryId: draft.categoryId || null,
      transactionAt: new Date(draft.transactionAtISO).getTime(),
      paymentMethod: draft.paymentMethod,
      paymentProvider: draft.paymentMethod === 'cash' ? null : draft.paymentProvider || null,
      imageUrl: draft.imageUrl || null,
      imagePath: draft.imagePath || null,
      source: 'whatsapp',
      externalMessageId: draft.externalMessageId || null,
      ocrConfidence:
        draft.ocrConfidence == null ? null : String(Number(draft.ocrConfidence).toFixed(2)),
      ocrRaw: draft.ocrRaw || null,
    })
    .returning();

  return created;
}

async function handleAmountText({
  message,
  account,
  type,
}: {
  message: ParsedWhatsappMessage;
  account: typeof whatsappAccounts.$inferSelect;
  type: TxType;
}) {
  const text = message.text || '';
  const amount = extractAmount(text);

  if (!amount) {
    await sendWhatsappText(
      message.from,
      `Nominal belum terbaca. Contoh: ${getTypeLabel(type)} 25000 atau langsung kirim foto struk.`
    );
    return;
  }

  const category = await findCategoryId(account.userId, type, 'Lainnya');
  const title = text
    .replace(/rp/gi, '')
    .replace(/[0-9., ]+/g, ' ')
    .replace(/pengeluaran|pemasukan|expense|income/gi, '')
    .trim();

  const draft: DraftTransaction = {
    type,
    title: title || (type === 'income' ? 'Pemasukan dari WhatsApp' : 'Pengeluaran dari WhatsApp'),
    amount,
    note: 'Dicatat dari WhatsApp.',
    categoryId: category?.id || null,
    categoryName: category?.name || 'Lainnya',
    transactionAtISO: new Date().toISOString(),
    paymentMethod: 'cash',
    paymentProvider: null,
    externalMessageId: message.id,
  };

  await askConfirmation(message.from, account.id, draft);
}

async function handleImageMessage({
  message,
  account,
  type,
}: {
  message: ParsedWhatsappMessage;
  account: typeof whatsappAccounts.$inferSelect;
  type: TxType;
}) {
  if (!message.mediaId) {
    await sendWhatsappText(message.from, 'Gambar tidak valid. Coba kirim ulang foto struk.');
    return;
  }

  await sendWhatsappText(message.from, 'Foto diterima. Saya sedang membaca struk dan menyiapkan transaksi...');

  const media = await downloadWhatsappMedia(message.mediaId);
  const uploaded = await uploadTransactionImageFromBuffer({
    buffer: media.buffer,
    fileName: `${message.id}.jpg`,
    contentType: media.contentType,
    prefix: `transactions/whatsapp/${account.userId}`,
  });

  const receipt = await parseReceiptImage({
    imageUrl: uploaded.url,
    typeHint: type,
  });

  const draft = await buildDraftFromReceipt({
    userId: account.userId,
    type,
    receipt,
    imageUrl: uploaded.url,
    imagePath: uploaded.pathname,
    messageId: message.id,
  });

  if (!draft) {
    await updateConversation(account.id, 'waiting_amount_or_photo', { type });
    await sendWhatsappText(
      message.from,
      'Foto berhasil disimpan, tapi nominal belum terbaca. Balas nominalnya, contoh: 45000.'
    );
    return;
  }

  await askConfirmation(message.from, account.id, draft);
}

async function handleLinkedMessage(message: ParsedWhatsappMessage, account: typeof whatsappAccounts.$inferSelect) {
  const text = normalizeText(message.text);
  const conversation = await getConversation(account.id);
  const payload = (conversation.payload || {}) as ConversationPayload;

  if (['menu', 'start', 'mulai', 'halo', 'hi'].includes(text)) {
    await updateConversation(account.id, 'idle', {});
    await sendMainMenu(message.from);
    return;
  }

  if (isCancel(text)) {
    await clearConversation(account.id);
    await sendWhatsappText(message.from, 'Oke, transaksi dibatalkan. Ketik menu untuk mulai lagi.');
    return;
  }

  if (isStartExpense(text) || isStartIncome(text)) {
    const type = isStartIncome(text) ? 'income' : 'expense';
    await updateConversation(account.id, 'waiting_amount_or_photo', { type });
    await sendWhatsappText(
      message.from,
      `Oke, ${getTypeLabel(type)}. Silakan kirim nominal manual atau kirim foto struk/bukti transaksi.`
    );
    return;
  }

  if (conversation.state === 'waiting_confirmation') {
    const draft = payload.draft;

    if (!draft) {
      await clearConversation(account.id);
      await sendWhatsappText(message.from, 'Draft transaksi tidak ditemukan. Ketik menu untuk mulai lagi.');
      return;
    }

    if (isConfirm(text)) {
      await saveDraft(account.userId, draft);
      await clearConversation(account.id);
      await sendWhatsappText(
        message.from,
        `Transaksi berhasil disimpan.\n${getTypeLabel(draft.type)}: ${formatIDR(draft.amount)}\nJudul: ${draft.title}`
      );
      await sendMainMenu(message.from);
      return;
    }

    await sendWhatsappText(message.from, 'Balas Simpan untuk menyimpan atau Batal untuk membatalkan.');
    return;
  }

  if (conversation.state === 'waiting_amount_or_photo') {
    const type = payload.type || 'expense';

    if (message.type === 'image') {
      await handleImageMessage({ message, account, type });
      return;
    }

    await handleAmountText({ message, account, type });
    return;
  }

  if (message.type === 'image') {
    await sendWhatsappText(
      message.from,
      'Pilih dulu jenis transaksi sebelum mengirim struk.'
    );
    await sendMainMenu(message.from);
    return;
  }

  await sendMainMenu(message.from);
}

export async function processWhatsappMessage(
  message: ParsedWhatsappMessage,
  rawPayload: Record<string, unknown>
) {
  const isNew = await markInboundProcessed(message, rawPayload);
  if (!isNew) return;

  if (message.type === 'unknown') {
    await sendWhatsappText(message.from, 'Format pesan belum didukung. Kirim teks atau foto struk ya.');
    return;
  }

  const linkedByToken = await tryLinkWhatsappAccount(message);
  if (linkedByToken) return;

  const phoneNumber = normalizePhoneNumber(message.from);
  const account = await getLinkedAccount(phoneNumber);

  if (!account) {
    await sendNeedLink(message.from);
    return;
  }

  try {
    await handleLinkedMessage(message, account);
  } catch (error) {
    console.error('WhatsApp message processing error:', error);
    await clearConversation(account.id).catch(() => undefined);
    await sendWhatsappText(
      message.from,
      'Maaf, terjadi kesalahan saat memproses pesan. Coba lagi dengan ketik menu.'
    ).catch(() => undefined);
  }
}
