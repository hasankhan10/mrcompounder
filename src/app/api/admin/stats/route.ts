import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getTodayIST } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createServerSupabaseClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    try {
        // 2. Fetch Stats
        // Total Clinics
        const { count: totalClinics } = await supabaseAdmin
            .from('clinics')
            .select('*', { count: 'exact', head: true });

        // Total Patients Served Today (via Session Date)
        const todayIST = getTodayIST(); // YYYY-MM-DD

        // 1. Get IDs of queues for today
        const { data: todayQueues } = await supabaseAdmin
            .from('queues')
            .select('id')
            .eq('session_date', todayIST);

        let totalPatientsToday = 0;

        if (todayQueues && todayQueues.length > 0) {
            const queueIds = todayQueues.map(q => q.id);

            // 2. Count served tokens in these queues
            const { count } = await supabaseAdmin
                .from('tokens')
                .select('*', { count: 'exact', head: true })
                .in('queue_id', queueIds)
                .eq('status', 'served');

            totalPatientsToday = count || 0;
        }

        // Total Revenue (Sum of all approved payment requests)
        const { data: approvedRequests } = await supabaseAdmin
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved');

        const totalRevenue = approvedRequests?.reduce((sum, req) => sum + (req.amount || 0), 0) || 0;

        // Last Month Revenue
        const firstDayLastMonth = new Date();
        firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
        firstDayLastMonth.setDate(1);
        firstDayLastMonth.setHours(0, 0, 0, 0);

        const lastDayLastMonth = new Date();
        lastDayLastMonth.setDate(0); // Last day of previous month
        lastDayLastMonth.setHours(23, 59, 59, 999);

        const { data: lastMonthRequests } = await supabaseAdmin
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved')
            .gte('updated_at', firstDayLastMonth.toISOString())
            .lte('updated_at', lastDayLastMonth.toISOString());

        const lastMonthRevenue = lastMonthRequests?.reduce((sum, req) => sum + (req.amount || 0), 0) || 0;

        return NextResponse.json({
            totalClinics: totalClinics || 0,
            totalPatientsToday: totalPatientsToday || 0,
            totalRevenue,
            lastMonthRevenue
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
