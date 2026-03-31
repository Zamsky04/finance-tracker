// src/app/api/reports/summary/route.ts
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

type RawSummaryRow = {
  total_income: number | string | null;
  total_expense: number | string | null;
  balance: number | string | null;
};

function toNumber(value: number | string | null | undefined) {
  if (value == null) return 0;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toMillis(value: string | null) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const fromMs = toMillis(from);
    const toMs = toMillis(to);

    const result = await db.execute(sql`
      select
        coalesce(sum(case when type = 'income' then amount else 0 end), 0) as total_income,
        coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as total_expense,
        coalesce(sum(case when type = 'income' then amount else -amount end), 0) as balance
      from transactions
      where user_id = ${user.id}
        and (${fromMs}::bigint is null or transaction_at_ms >= ${fromMs}::bigint)
        and (${toMs}::bigint is null or transaction_at_ms <= ${toMs}::bigint)
    `);

    const rows = (result.rows ?? []) as RawSummaryRow[];
    const row = rows[0];

    return Response.json({
      total_income: toNumber(row?.total_income),
      total_expense: toNumber(row?.total_expense),
      balance: toNumber(row?.balance),
    });
  } catch (error) {
    console.error('GET /api/reports/summary error:', error);
    return Response.json(
      {
        total_income: 0,
        total_expense: 0,
        balance: 0,
      },
      { status: 500 }
    );
  }
}