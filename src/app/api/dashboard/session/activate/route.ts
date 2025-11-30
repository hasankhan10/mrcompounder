import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    const { sessionId } = body;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Update Queue Status
    const { data: updatedQueue, error } = await supabase
        .from('queues')
        .update({ status: 'active' })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return NextResponse.json(updatedQueue, { status: 200 });
}
