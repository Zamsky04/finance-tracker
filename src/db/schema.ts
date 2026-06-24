// src/db/schema.ts
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  jsonb,
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
    source: varchar('source', { length: 30 })
      .$type<'web' | 'whatsapp'>()
      .default('web')
      .notNull(),
    externalMessageId: varchar('external_message_id', { length: 255 }),
    ocrConfidence: numeric('ocr_confidence', { precision: 5, scale: 2 }),
    ocrRaw: jsonb('ocr_raw').$type<Record<string, unknown> | null>(),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_transactions_user_id').on(table.userId),
    transactionAtIdx: index('idx_transactions_transaction_at').on(table.transactionAt),
    typeIdx: index('idx_transactions_type').on(table.type),
    categoryIdx: index('idx_transactions_category').on(table.categoryId),
    sourceIdx: index('idx_transactions_source').on(table.source),
    externalMessageIdx: index('idx_transactions_external_message_id').on(
      table.externalMessageId
    ),
  })
);

export const whatsappAccounts = pgTable(
  'whatsapp_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    phoneNumber: varchar('phone_number', { length: 32 }).notNull(),
    waId: varchar('wa_id', { length: 64 }),
    displayName: varchar('display_name', { length: 150 }),
    isActive: boolean('is_active').default(true).notNull(),
    linkedAt: bigint('linked_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_whatsapp_accounts_user_id').on(table.userId),
    phoneNumberUnique: uniqueIndex('uq_whatsapp_accounts_phone_number').on(
      table.phoneNumber
    ),
  })
);

export const whatsappLinkTokens = pgTable(
  'whatsapp_link_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: bigint('expires_at_ms', { mode: 'number' }).notNull(),
    usedAt: bigint('used_at_ms', { mode: 'number' }),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_whatsapp_link_tokens_user_id').on(table.userId),
    tokenHashUnique: uniqueIndex('uq_whatsapp_link_tokens_token_hash').on(
      table.tokenHash
    ),
    expiresAtIdx: index('idx_whatsapp_link_tokens_expires_at').on(table.expiresAt),
  })
);

export const whatsappConversations = pgTable(
  'whatsapp_conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    whatsappAccountId: uuid('whatsapp_account_id')
      .notNull()
      .references(() => whatsappAccounts.id, { onDelete: 'cascade' }),
    state: varchar('state', { length: 60 }).default('idle').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    lastMessageAt: bigint('last_message_at_ms', { mode: 'number' })
      .default(epochNow)
      .notNull(),
    createdAt: bigint('created_at_ms', { mode: 'number' }).default(epochNow).notNull(),
    updatedAt: bigint('updated_at_ms', { mode: 'number' }).default(epochNow).notNull(),
  },
  (table) => ({
    accountUnique: uniqueIndex('uq_whatsapp_conversations_account').on(
      table.whatsappAccountId
    ),
    accountIdx: index('idx_whatsapp_conversations_account').on(
      table.whatsappAccountId
    ),
  })
);

export const whatsappInboundMessages = pgTable('whatsapp_inbound_messages', {
  messageId: varchar('message_id', { length: 255 }).primaryKey(),
  phoneNumber: varchar('phone_number', { length: 32 }),
  rawPayload: jsonb('raw_payload').$type<Record<string, unknown> | null>(),
  processedAt: bigint('processed_at_ms', { mode: 'number' }).default(epochNow).notNull(),
});
