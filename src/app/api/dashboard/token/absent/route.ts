import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CallNextRequest } from '@/lib/types'; // We can reuse this type or create a new one if needed
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/dashboard/token/absent
 * @summary Marks the current token as 'no_show' (Absent) and calls the next token.
 * @description Crucially, this does NOT generate a bill/transaction.
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body: CallNextRequest = await request.json(); // { queueId, currentCalledTokenId }

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Mark current token as 'no_show' (Absent)
    let absentToken = null;
    if (body.currentCalledTokenId) {
        const { data: markedAbsent, error: absentError } = await supabase
            .from('tokens')
            .update({ status: 'no_show' })
            .eq('id', body.currentCalledTokenId)
            .select()
            .single();

        if (absentError) {
            console.error('Error marking token absent:', absentError);
            return new NextResponse(JSON.stringify({ error: absentError.message }), { status: 500 });
        }
        absentToken = markedAbsent;

        // NOTE: NO BILLING LOGIC HERE. That is the key difference from 'call-next'.
    }

    // 3. Find next waiting token
    const { data: nextToken } = await supabase
        .from('tokens')
        .select('*')
        .eq('queue_id', body.queueId)
        .eq('status', 'waiting')
        .order('token_number', { ascending: true })
        .limit(1)
        .single();

    if (!nextToken) {
        return NextResponse.json({
            message: 'Queue is empty',
            absentToken
        });
    }

    // 4. Mark next token as called
    const { data: calledToken, error: callError } = await supabase
        .from('tokens')
        .update({ status: 'called' })
        .eq('id', nextToken.id)
        .select()
        .single();

    if (callError) {
        return new NextResponse(JSON.stringify({ error: callError.message }), { status: 500 });
    }

    return NextResponse.json({
        absentToken,
        calledToken
    });
}
