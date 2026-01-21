import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Determine which client to use
    let dbClient = supabase;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const { searchParams } = new URL(request.url);
        const guestToken = searchParams.get('token');

        if (!guestToken) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Verify guestToken belongs to the queue of this token (USING ADMIN CLIENT)
        const { data: tokenData } = await supabaseAdmin
            .from('tokens')
            .select('queue_id')
            .eq('id', id)
            .maybeSingle();

        if (!tokenData) {
            return new NextResponse(JSON.stringify({ error: 'Token not found' }), { status: 404 });
        }

        const { data: queue } = await supabaseAdmin
            .from('queues')
            .select('id')
            .eq('id', tokenData.queue_id)
            .eq('share_token', guestToken)
            .maybeSingle();

        if (!queue) {
            return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
        }

        // AUTH SUCCESS AS GUEST -> Use Admin client to bypass RLS
        dbClient = supabaseAdmin;
    }

    // 2. Delete Token
    const { error } = await dbClient
        .from('tokens')
        .delete()
        .eq('id', id);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}
