// src/app/api/profile/route.ts
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return Response.json(rows[0] ?? null);
}