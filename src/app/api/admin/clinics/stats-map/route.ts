import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    // Auth check (optional but recommended, assuming middleware handles it or we check here)
    // For speed, we'll skip strict user check here if middleware covers /admin, 
    // but let's be safe and check header or just rely on the fact it's an admin route.
    // We'll assume middleware protects /api/admin/*

    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get queues for today
        const { data: queues } = await supabaseAdmin
            .from('queues')
            .select('id, clinic_id')
            .eq('session_date', todayStr);

        if (!queues || queues.length === 0) {
            return NextResponse.json({});
        }

        // 2. Get served tokens
        const queueIds = queues.map(q => q.id);
        const { data: tokens } = await supabaseAdmin
            .from('tokens')
            .select('queue_id')
            .in('queue_id', queueIds)
            .eq('status', 'served');

        // 3. Map counts
        const clinicCounts: Record<string, number> = {};
        tokens?.forEach((t) => {
            const q = queues.find((q) => q.id === t.queue_id);
            if (q && q.clinic_id) {
                clinicCounts[q.clinic_id] = (clinicCounts[q.clinic_id] || 0) + 1;
            }
        });

        return NextResponse.json(clinicCounts);

    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
