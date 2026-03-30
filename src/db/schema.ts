// src/db/schema.ts
import { sql } from 'drizzle-orm';
import {
  bigint,
  index,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const epochNow = sql`public.epoch_ms_now()`;

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: varchar('full_name', { length: 150 }),
  email: varchar('email', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
});

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    type: varchar('type', { length: 20 })
      .$type<'income' | 'expense'>()
      .notNull(),
    color: varchar('color', { length: 20 }),
    icon: varchar('icon', { length: 60 }),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_categories_user_id').on(table.userId),
    userNameTypeUnique: uniqueIndex('uq_categories_user_name_type').on(
      table.userId,
      table.name,
      table.type
    ),
  })
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    type: varchar('type', { length: 20 })
      .$type<'income' | 'expense'>()
      .notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    title: varchar('title', { length: 180 }).notNull(),
    note: text('note'),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    transactionAt: bigint('transaction_at_ms', { mode: 'number' })
      .default(epochNow)
      .notNull(),
    paymentMethod: varchar('payment_method', { length: 30 }).$type<
      'bank_transfer' | 'e_wallet' | 'cash' | null
    >(),
    paymentProvider: varchar('payment_provider', { length: 50 }),
    imageUrl: text('image_url'),
    imagePath: text('image_path'),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_transactions_user_id').on(table.userId),
    transactionAtIdx: index('idx_transactions_transaction_at').on(table.transactionAt),
    typeIdx: index('idx_transactions_type').on(table.type),
    categoryIdx: index('idx_transactions_category').on(table.categoryId),
  })
);