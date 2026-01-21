import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CallNextRequest } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/dashboard/token/absent
 * @summary Marks the current token as 'no_show'
 * @tags Dashboard
 * @param {CallNextRequest} request.body.required - The queue and token data
 * @return {object} 200 - Success response
 * @return {object} 400 - Bad request
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body: CallNextRequest = await request.json();

    if (!body.currentCalledTokenId) {
        return new NextResponse(JSON.stringify({ error: 'No token ID provided' }), { status: 400 });
    }

    // Determine which client to use: Standard (Auth) or Admin (Guest with shareToken)
    let dbClient = supabase;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    // If not logged in, check for share token
    if (!user) {
        if (!body.shareToken) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Verify share token matches the queue
        const { data: queue } = await supabaseAdmin
            .from('queues')
            .select('id')
            .eq('id', body.queueId)
            .eq('share_token', body.shareToken)
            .maybeSingle();

        if (!queue) {
            return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
        }

        // AUTH SUCCESS AS GUEST -> Use Admin client to bypass RLS
        dbClient = supabaseAdmin;
    }

    // 2. Mark current token as no_show
    const { data: updatedToken, error } = await dbClient
        .from('tokens')
        .update({ status: 'no_show' })
        .eq('id', body.currentCalledTokenId)
        .select()
        .maybeSingle();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // 3. Find next waiting token (Same logic as call-next but prioritizing emergency)
    const { data: nextToken } = await dbClient
        .from('tokens')
        .select('*')
        .eq('queue_id', body.queueId)
        .eq('status', 'waiting')
        .order('is_emergency', { ascending: false, nullsFirst: false })
        .order('token_number', { ascending: true })
        .limit(1)
        .maybeSingle();

    let calledToken = null;

    if (nextToken) {
        // 4. Mark next token as called
        const { data: nextCalled, error: callError } = await dbClient
            .from('tokens')
            .update({ status: 'called' })
            .eq('id', nextToken.id)
            .select()
            .maybeSingle();

        if (!callError) {
            calledToken = nextCalled;
        }
    }

    return NextResponse.json({
        updatedToken,
        calledToken
    });
}
