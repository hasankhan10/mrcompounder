import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    let body;
    try {
        body = await request.json();
    } catch {
        return new NextResponse(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }
    const { sessionId } = body;

    if (!sessionId) {
        return new NextResponse(JSON.stringify({ error: 'Missing sessionId' }), { status: 400 });
    }

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Ownership Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

    if (!profile?.clinic_id) {
        return new NextResponse(JSON.stringify({ error: 'Clinic not found' }), { status: 404 });
    }

    // 3. Update Queue Status scoped to clinic_id
    const { data: updatedQueue, error } = await supabase
        .from('queues')
        .update({ status: 'active' })
        .eq('id', sessionId)
        .eq('clinic_id', profile.clinic_id)
        .select()
        .single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!updatedQueue) {
        return new NextResponse(JSON.stringify({ error: 'Session not found or access denied' }), { status: 404 });
    }

    return NextResponse.json(updatedQueue, { status: 200 });
}
