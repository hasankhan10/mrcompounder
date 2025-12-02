// src/lib/supabase-server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import the official type
import { cookies } from 'next/headers';

// The placeholder interface is no longer needed.

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // This error is expected when trying to set a cookie from a Server Component.
            // It can be safely ignored.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // This error is expected when trying to remove a cookie from a Server Component.
            // It can be safely ignored.
          }
        },
      },
    }
  );
}
