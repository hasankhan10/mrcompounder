import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queueId = searchParams.get('queueId');

    if (!queueId) {
        return NextResponse.json({ error: 'Missing queueId' }, { status: 400 });
    }

    try {
        const { data: queue, error } = await supabaseAdmin
            .from('queues')
            .select('status')
            .eq('id', queueId)
            .single();

        if (error) throw error;

        return NextResponse.json({ status: queue.status });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
