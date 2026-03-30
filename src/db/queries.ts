// src/db/queries.ts
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { categories } from '@/db/schema';

export async function getCategories(
  userId: string,
  type?: 'income' | 'expense'
) {
  const conditions = [eq(categories.userId, userId)];

  if (type) {
    conditions.push(eq(categories.type, type));
  }

  return await db
    .select({
      id: categories.id,
      userId: categories.userId,
      name: categories.name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .where(and(...conditions))
    .orderBy(asc(categories.type), asc(categories.name));
}