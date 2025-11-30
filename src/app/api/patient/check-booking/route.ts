import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const { clinicId, phone } = await request.json();

        if (!clinicId || !phone) {
            return NextResponse.json({ error: 'Missing clinicId or phone' }, { status: 400 });
        }

        // 1. Find Active Queue for this Clinic
        const { data: queue, error: queueError } = await supabaseAdmin
            .from('queues')
            .select('*')
            .eq('clinic_id', clinicId)
            .in('status', ['active', 'waiting', 'paused'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (queueError || !queue) {
            return NextResponse.json({ error: 'No active session found for this clinic.' }, { status: 404 });
        }

        // 2. Parallel Fetch: Token, Current Called, Last Served (5 items)
        const [tokenResult, currentTokenResult, lastServedResult] = await Promise.all([
            // Fetch Patient Token
            supabaseAdmin
                .from('tokens')
                .select('*')
                .eq('queue_id', queue.id)
                .eq('phone', phone)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),

            // Fetch Currently Called Token
            supabaseAdmin
                .from('tokens')
                .select('*')
                .eq('queue_id', queue.id)
                .eq('status', 'called')
                .single(),

            // Fetch Last 5 Served Tokens (for Sliding Window Wait Time)
            supabaseAdmin
                .from('tokens')
                .select('served_at, token_number')
                .eq('queue_id', queue.id)
                .eq('status', 'served')
                .order('served_at', { ascending: false })
                .limit(5)
        ]);

        const token = tokenResult.data;
        if (!token) {
            return NextResponse.json({ error: 'No booking found for this number in the current session.' }, { status: 404 });
        }

        const currentToken = currentTokenResult.data;

        // Sliding Window Data
        const lastServedTokens = lastServedResult.data || [];
        const lastServedTokenNumber = lastServedTokens.length > 0 ? lastServedTokens[0].token_number : 0;

        return NextResponse.json({
            token,
            queue,
            currentToken,
            lastServedTokenNumber,
            lastServedTokens
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
