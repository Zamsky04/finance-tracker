import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublishableKey();

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set'
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
        }
      },
    },
  });
}