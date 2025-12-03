import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
    const supabase = await createServerSupabaseClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Get Clinic ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

    if (!profile?.clinic_id) {
        return new NextResponse(JSON.stringify({ error: 'Clinic not found' }), { status: 404 });
    }

    // 3. Fetch History (Ended sessions) with served token count
    const { data: history, error } = await supabase
        .from('queues')
        .select('*, tokens(count)')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'ended')
        .eq('tokens.status', 'served') // Only count served tokens
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Map the result to flatten the count structure
    const historyWithCount = history.map((session: any) => ({
        ...session,
        served_count: session.tokens?.[0]?.count || 0
    }));

    return NextResponse.json(historyWithCount);
}
