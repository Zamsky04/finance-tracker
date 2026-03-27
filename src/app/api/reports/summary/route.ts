import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const result = await db.execute(sql`
    select
      coalesce(sum(case when type = 'income' then amount else 0 end), 0) as total_income,
      coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as total_expense,
      coalesce(sum(case when type = 'income' then amount else -amount end), 0) as balance
    from transactions
    where (${from}::timestamptz is null or transaction_at >= ${from}::timestamptz)
      and (${to}::timestamptz is null or transaction_at <= ${to}::timestamptz)
  `);

  return Response.json(result.rows[0]);
}