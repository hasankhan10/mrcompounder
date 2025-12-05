import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export type AuthResult =
    | { user: any; error: null }
    | { user: null; error: NextResponse };

/**
 * Helper to ensure the request is made by a Super Admin.
 * Returns the user object if authorized, or a NextResponse with error if not.
 */
export async function requireSuperAdmin(): Promise<AuthResult> {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null,
            error: new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'super_admin') {
        return {
            user: null,
            error: new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
        };
    }

    return { user, error: null };
}
