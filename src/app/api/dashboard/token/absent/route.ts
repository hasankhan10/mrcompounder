import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CallNextRequest } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Mark current token as no_show
    const { data: updatedToken, error } = await supabase
        .from('tokens')
        .update({ status: 'no_show' })
        .eq('id', body.currentCalledTokenId)
        .select()
        .single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // 3. Find next waiting token (Same logic as call-next but prioritizing emergency)
    const { data: nextToken } = await supabase
        .from('tokens')
        .select('*')
        .eq('queue_id', body.queueId)
        .eq('status', 'waiting')
        .order('is_emergency', { ascending: false, nullsFirst: false })
        .order('token_number', { ascending: true })
        .limit(1)
        .single();

    let calledToken = null;

    if (nextToken) {
        // 4. Mark next token as called
        const { data: nextCalled, error: callError } = await supabase
            .from('tokens')
            .update({ status: 'called' })
            .eq('id', nextToken.id)
            .select()
            .single();

        if (!callError) {
            calledToken = nextCalled;
        }
    }

    return NextResponse.json({
        updatedToken,
        calledToken
    });
}
