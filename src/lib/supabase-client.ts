// src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr';

// This function creates a Supabase client for use in Client Components.
// It reads the environment variables from the browser's context.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
