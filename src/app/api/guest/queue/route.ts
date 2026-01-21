import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Token is required' }), { status: 400 });
    }

    // 1. Fetch queue by share_token with clinic details (Bypassing RLS for Guest)
    const { data: queue, error: queueError } = await supabaseAdmin
        .from('queues')
        .select(`
            *,
            clinics (
                name,
                slug
            )
        `)
        .eq('share_token', token)
        .maybeSingle();

    if (queueError || !queue) {
        return new NextResponse(JSON.stringify({ error: 'Invalid or expired access link' }), { status: 404 });
    }

    // 2. Fetch tokens for this queue (Bypassing RLS for Guest)
    const { data: tokens, error: tokenError } = await supabaseAdmin
        .from('tokens')
        .select('*')
        .eq('queue_id', queue.id)
        .order('token_number', { ascending: true });

    if (tokenError) {
        return new NextResponse(JSON.stringify({ error: tokenError.message }), { status: 500 });
    }

    return NextResponse.json({
        queue,
        tokens
    });
}
