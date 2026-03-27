import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  title: z.string().min(2).max(180),
  amount: z.coerce.number().positive(),
  note: z.string().max(5000).optional().or(z.literal('')),
  categoryId: z.string().uuid().nullable().optional(),
  transactionAt: z.string(),
  imageUrl: z.string().url().nullable().optional(),
  imagePath: z.string().nullable().optional(),
});