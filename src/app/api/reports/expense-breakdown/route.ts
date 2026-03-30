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
    with raw as (
      select
        coalesce(c.name, 'Tanpa Kategori') as category,
        coalesce(c.color, '#3b82f6') as color,
        sum(t.amount)::numeric as total
      from transactions t
      left join categories c
        on c.id = t.category_id
       and c.user_id = ${user.id}
      where t.user_id = ${user.id}
        and t.type = 'expense'
        and (${fromMs}::bigint is null or t.transaction_at_ms >= ${fromMs}::bigint)
        and (${toMs}::bigint is null or t.transaction_at_ms <= ${toMs}::bigint)
      group by 1, 2
    ),
    total_sum as (
      select coalesce(sum(total), 0) as grand_total from raw
    )
    select
      raw.category,
      raw.color,
      raw.total,
      case
        when total_sum.grand_total = 0 then 0
        else round((raw.total / total_sum.grand_total) * 100, 2)
      end as percentage
    from raw, total_sum
    order by raw.total desc
  `);

  return Response.json(result.rows);
}