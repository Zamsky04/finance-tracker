// src/app/api/reports/summary/route.ts
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

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

  return Response.json(result.rows[0]);
}