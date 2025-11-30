import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createServerSupabaseClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .select('*, clinics(name, slug)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });

    return NextResponse.json(data);
}
