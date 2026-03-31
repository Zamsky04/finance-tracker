// src/app/api/reports/cashflow-trend/route.ts
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

type RawRow = {
  date: string;
  income: number | string | null;
  expense: number | string | null;
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
      with filtered as (
        select
          to_char(
            to_timestamp(t.transaction_at_ms / 1000.0) at time zone 'Asia/Jakarta',
            'YYYY-MM-DD'
          ) as date,
          t.type,
          t.amount
        from transactions t
        where t.user_id = ${user.id}
          and (${fromMs}::bigint is null or t.transaction_at_ms >= ${fromMs}::bigint)
          and (${toMs}::bigint is null or t.transaction_at_ms <= ${toMs}::bigint)
      )
      select
        date,
        coalesce(sum(case when type = 'income' then amount else 0 end), 0) as income,
        coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as expense
      from filtered
      group by date
      order by date asc
    `);

    const rows = (result.rows ?? []) as RawRow[];

    const data = rows.map((row) => ({
      date: row.date,
      income: toNumber(row.income),
      expense: toNumber(row.expense),
    }));

    return Response.json(data);
  } catch (error) {
    console.error('GET /api/reports/cashflow-trend error:', error);
    return Response.json([], { status: 500 });
  }
}