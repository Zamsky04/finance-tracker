import { z } from 'zod';

export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    title: z.string().trim().min(1, 'Judul transaksi wajib diisi').max(180),
    amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
    note: z.string().trim().max(2000).nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    transactionAt: z.string().datetime(),

    paymentMethod: z.enum(['bank_transfer', 'e_wallet', 'cash']),
    paymentProvider: z.string().trim().max(50).nullable().optional(),

    imageUrl: z.string().trim().nullable().optional(),
    imagePath: z.string().trim().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentMethod'],
        message: 'Metode pembayaran wajib dipilih',
      });
    }

    if (
      (data.paymentMethod === 'bank_transfer' || data.paymentMethod === 'e_wallet') &&
      !data.paymentProvider
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentProvider'],
        message: 'Provider pembayaran wajib dipilih',
      });
    }
  });