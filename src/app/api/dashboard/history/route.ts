import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
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

    // 3. Fetch Ended Queues
    const { data: history, error } = await supabase
        .from('queues')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'ended')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Fetch counts for each queue
    const historyWithCounts = await Promise.all(history.map(async (queue) => {
        const { count } = await supabase
            .from('tokens')
            .select('*', { count: 'exact', head: true })
            .eq('queue_id', queue.id)
            .eq('status', 'served');

        return {
            ...queue,
            served_count: count || 0
        };
    }));

    return NextResponse.json(historyWithCounts, { status: 200 });
}
