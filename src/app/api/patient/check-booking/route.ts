import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const { clinicId, phone } = await request.json();

        if (!clinicId || !phone) {
            return NextResponse.json({ error: 'Missing clinicId or phone' }, { status: 400 });
        }

        // 1. Find ALL Active Queues for this Clinic
        const { data: activeQueues, error: queueError } = await supabaseAdmin
            .from('queues')
            .select('*')
            .eq('clinic_id', clinicId)
            .in('status', ['active', 'waiting', 'paused'])
            .order('created_at', { ascending: false });

        if (queueError || !activeQueues || activeQueues.length === 0) {
            return NextResponse.json({ error: 'No active session found for this clinic.' }, { status: 404 });
        }

        const activeQueueIds = activeQueues.map(q => q.id);

        // 2. Find Patient Tokens in ANY of the active queues
        const { data: tokens, error: tokenError } = await supabaseAdmin
            .from('tokens')
            .select('*')
            .in('queue_id', activeQueueIds)
            .eq('phone', phone)
            .order('created_at', { ascending: false });

        if (!tokens || tokens.length === 0) {
            return NextResponse.json({ error: 'No booking found for this number in any active session.' }, { status: 404 });
        }

        // 3. Build Booking Data for each token
        const bookings = await Promise.all(tokens.map(async (token) => {
            const queue = activeQueues.find(q => q.id === token.queue_id);
            if (!queue) return null;

            // Fetch Context for THAT Queue
            const [currentTokenResult, lastServedResult] = await Promise.all([
                supabaseAdmin
                    .from('tokens')
                    .select('*')
                    .eq('queue_id', queue.id)
                    .eq('status', 'called')
                    .maybeSingle(),

                supabaseAdmin
                    .from('tokens')
                    .select('served_at, token_number')
                    .eq('queue_id', queue.id)
                    .eq('status', 'served')
                    .order('served_at', { ascending: false })
                    .limit(5)
            ]);

            return {
                token,
                queue,
                currentToken: currentTokenResult.data,
                lastServedTokenNumber: lastServedResult.data?.[0]?.token_number || 0,
                lastServedTokens: lastServedResult.data || []
            };
        }));

        const validBookings = bookings.filter((b): b is NonNullable<typeof b> => b !== null);

        if (validBookings.length === 0) {
            return NextResponse.json({ error: 'Session data unavailable.' }, { status: 404 });
        }

        // Mark all as present
        const tokensToUpdate = validBookings.filter(b => !b.token.is_present).map(b => b.token.id);
        if (tokensToUpdate.length > 0) {
            await supabaseAdmin
                .from('tokens')
                .update({ is_present: true })
                .in('id', tokensToUpdate);

            validBookings.forEach(b => {
                if (tokensToUpdate.includes(b.token.id)) {
                    b.token.is_present = true;
                }
            });
        }

        return NextResponse.json({ bookings: validBookings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
