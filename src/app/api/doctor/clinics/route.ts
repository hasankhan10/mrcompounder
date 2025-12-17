
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Find clinics owned by this email
        const { data: clinics, error } = await supabaseAdmin
            .from('clinics')
            .select('*')
            .eq('owner_email', email)
            .eq('is_active', true);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!clinics || clinics.length === 0) {
            return NextResponse.json({ error: 'No clinics found for this email' }, { status: 404 });
        }

        // 2. Fetch live stats for each clinic (optional optimization: parallelize)
        const enrichedClinics = await Promise.all(clinics.map(async (clinic) => {
            // Get today's waiting queue
            const today = new Date().toISOString().split('T')[0];

            const { count: waitingCount } = await supabaseAdmin
                .from('tokens')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', clinic.id)
                .eq('status', 'waiting')
                .gte('created_at', today);

            return {
                ...clinic,
                waiting_count: waitingCount || 0
            };
        }));

        return NextResponse.json({ clinics: enrichedClinics });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
