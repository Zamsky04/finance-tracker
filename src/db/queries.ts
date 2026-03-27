import { db } from '@/db';
import { categories } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}