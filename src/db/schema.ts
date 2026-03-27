import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  type: varchar('type', { length: 20 })
    .$type<'income' | 'expense'>()
    .notNull(),
  color: varchar('color', { length: 20 }),
  icon: varchar('icon', { length: 60 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 20 })
      .$type<'income' | 'expense'>()
      .notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    title: varchar('title', { length: 180 }).notNull(),
    note: text('note'),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    transactionAt: timestamp('transaction_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    paymentMethod: varchar('payment_method', { length: 30 }).$type<
      'bank_transfer' | 'e_wallet' | 'cash' | null
    >(),
    paymentProvider: varchar('payment_provider', { length: 50 }),
    imageUrl: text('image_url'),
    imagePath: text('image_path'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    transactionAtIdx: index('idx_transactions_transaction_at').on(table.transactionAt),
    typeIdx: index('idx_transactions_type').on(table.type),
    categoryIdx: index('idx_transactions_category').on(table.categoryId),
  })
);