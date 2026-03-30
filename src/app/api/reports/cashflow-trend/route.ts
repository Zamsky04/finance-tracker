import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

type Row = {
  date: string;
  income: number | string;
  expense: number | string;
};

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const fromMs = from ? new Date(from).getTime() : null;
  const toMs = to ? new Date(to).getTime() : null;

  const result = await db.execute(sql<Row>`
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

  return Response.json(result.rows);
}