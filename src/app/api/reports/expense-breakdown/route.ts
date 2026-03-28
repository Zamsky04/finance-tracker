import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const result = await db.execute(sql`
    with raw as (
      select
        coalesce(c.name, 'Tanpa Kategori') as category,
        coalesce(c.color, '#3b82f6') as color,
        sum(t.amount)::numeric as total
      from transactions t
      left join categories c on c.id = t.category_id
      where t.type = 'expense'
        and (${from}::timestamptz is null or t.transaction_at >= ${from}::timestamptz)
        and (${to}::timestamptz is null or t.transaction_at <= ${to}::timestamptz)
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