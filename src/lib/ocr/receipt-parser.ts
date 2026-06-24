// src/lib/ocr/receipt-parser.ts
export type ReceiptParseResult = {
  type?: 'income' | 'expense';
  title: string;
  amount: number | null;
  note?: string | null;
  categoryName?: string | null;
  transactionAtISO?: string | null;
  paymentMethod?: 'bank_transfer' | 'e_wallet' | 'cash' | null;
  paymentProvider?: string | null;
  confidence: number;
  raw?: Record<string, unknown> | null;
};

function pickJson(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Response OCR tidak berformat JSON');
  }
}

function normalizePaymentMethod(value: unknown): ReceiptParseResult['paymentMethod'] {
  if (value === 'bank_transfer' || value === 'e_wallet' || value === 'cash') return value;
  return 'cash';
}

function normalizeType(value: unknown, fallback: 'income' | 'expense') {
  return value === 'income' || value === 'expense' ? value : fallback;
}

function normalizeAmount(value: unknown) {
  const amount = typeof value === 'number' ? value : Number(String(value || '').replace(/\D/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export async function parseReceiptImage({
  imageUrl,
  typeHint = 'expense',
}: {
  imageUrl: string;
  typeHint?: 'income' | 'expense';
}): Promise<ReceiptParseResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      type: typeHint,
      title: typeHint === 'income' ? 'Pemasukan dari WhatsApp' : 'Pengeluaran dari WhatsApp',
      amount: null,
      note: 'OCR belum aktif karena OPENAI_API_KEY belum diset.',
      categoryName: typeHint === 'income' ? 'Lainnya' : 'Lainnya',
      transactionAtISO: new Date().toISOString(),
      paymentMethod: 'cash',
      paymentProvider: null,
      confidence: 0,
      raw: null,
    };
  }

  const model = process.env.OPENAI_RECEIPT_MODEL || 'gpt-4.1-mini';

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Baca gambar struk/bukti transaksi ini. Kembalikan JSON valid saja tanpa markdown dengan schema: {"type":"income|expense","title":"merchant/keterangan singkat","amount":number|null,"note":"ringkasan singkat","categoryName":"nama kategori Indonesia","transactionAtISO":"ISO datetime atau null","paymentMethod":"bank_transfer|e_wallet|cash","paymentProvider":"bca|bri|mandiri|bni|seabank|cimb_niaga|permata|btn|danamon|bsi|jago|gopay|ovo|shopeepay|dana|linkaja|null","confidence":number 0-1}. Default type adalah ${typeHint}. Untuk struk belanja gunakan type expense. Gunakan kategori umum seperti Makan & Minum, Transport, Operasional, Belanja, Tagihan, Kesehatan, Lainnya, Gaji, Bonus, Penjualan. Ambil total akhir yang harus dibayar, bukan subtotal atau kembalian.`,
            },
            {
              type: 'input_image',
              image_url: imageUrl,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OCR gagal: ${res.status} ${detail}`);
  }

  const data = (await res.json()) as any;
  const text =
    data.output_text ||
    data.output?.flatMap((item: any) => item.content || [])
      ?.map((content: any) => content.text || '')
      ?.join('\n') ||
    '';

  const parsed = pickJson(text) as Record<string, unknown>;
  const amount = normalizeAmount(parsed.amount);
  const confidence = Number(parsed.confidence ?? 0);

  return {
    type: normalizeType(parsed.type, typeHint),
    title: String(parsed.title || (typeHint === 'income' ? 'Pemasukan dari WhatsApp' : 'Pengeluaran dari WhatsApp')).slice(0, 180),
    amount,
    note: parsed.note ? String(parsed.note).slice(0, 2000) : null,
    categoryName: parsed.categoryName ? String(parsed.categoryName).slice(0, 120) : 'Lainnya',
    transactionAtISO: parsed.transactionAtISO ? String(parsed.transactionAtISO) : new Date().toISOString(),
    paymentMethod: normalizePaymentMethod(parsed.paymentMethod),
    paymentProvider: parsed.paymentProvider ? String(parsed.paymentProvider).slice(0, 50) : null,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
    raw: parsed,
  };
}
