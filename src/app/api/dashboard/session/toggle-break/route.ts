import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    const { sessionId, newStatus, shareToken } = body;

    let dbClient = supabase;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        if (!shareToken) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Verify share token matches the queue
        const { data: queue } = await supabaseAdmin
            .from('queues')
            .select('id')
            .eq('id', sessionId)
            .eq('share_token', shareToken)
            .maybeSingle();

        if (!queue) {
            return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
        }

        dbClient = supabaseAdmin;
    } else {
        // Authenticated compounder: verify ownership
        const { data: profile } = await supabase
            .from('profiles')
            .select('clinic_id')
            .eq('id', user.id)
            .single();

        if (profile?.clinic_id) {
            const { data: queueOwnership } = await supabase
                .from('queues')
                .select('id')
                .eq('id', sessionId)
                .eq('clinic_id', profile.clinic_id)
                .maybeSingle();

            if (!queueOwnership) {
                return new NextResponse(JSON.stringify({ error: 'Session not found or access denied' }), { status: 403 });
            }
        }
    }

    // 2. Update Queue Status
    const { data: updatedQueue, error } = await dbClient
        .from('queues')
        .update({ status: newStatus })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return NextResponse.json(updatedQueue, { status: 200 });
}
