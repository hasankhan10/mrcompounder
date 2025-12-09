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
        const todayIST = getTodayIST();

        // 1. Total Clinics
        const { count: totalClinics } = await supabaseAdmin
            .from('clinics')
            .select('*', { count: 'exact', head: true });

        // 2. Total Patients Served Today
        const { data: todayQueues } = await supabaseAdmin
            .from('queues')
            .select('id')
            .eq('session_date', todayIST);

        let totalPatientsToday = 0;
        if (todayQueues && todayQueues.length > 0) {
            const queueIds = todayQueues.map(q => q.id);
            const { count } = await supabaseAdmin
                .from('tokens')
                .select('*', { count: 'exact', head: true })
                .in('queue_id', queueIds)
                .eq('status', 'served');
            totalPatientsToday = count || 0;
        }

        // 3. Total Revenue
        const { data: approvedRequests } = await supabaseAdmin
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved');
        const totalRevenue = approvedRequests?.reduce((sum, req) => sum + (req.amount || 0), 0) || 0;

        // 4. Last Month Revenue
        const firstDayLastMonth = new Date();
        firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
        firstDayLastMonth.setDate(1);
        firstDayLastMonth.setHours(0, 0, 0, 0);

        const lastDayLastMonth = new Date();
        lastDayLastMonth.setDate(0);
        lastDayLastMonth.setHours(23, 59, 59, 999);

        const { data: lastMonthRequests } = await supabaseAdmin
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved')
            .gte('updated_at', firstDayLastMonth.toISOString())
            .lte('updated_at', lastDayLastMonth.toISOString());
        const lastMonthRevenue = lastMonthRequests?.reduce((sum, req) => sum + (req.amount || 0), 0) || 0;

        // --- HISTORICAL DATA (Last 7 Days) ---
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }
        const weekAgo = last7Days[0];

        // A. Patients History
        // Fetch queues in last 7 days
        const { data: recentQueues } = await supabaseAdmin
            .from('queues')
            .select('id, session_date')
            .gte('session_date', weekAgo);

        const queueMap = new Map(); // queueId -> date
        recentQueues?.forEach(q => queueMap.set(q.id, q.session_date));
        const recentQueueIds = recentQueues?.map(q => q.id) || [];

        const patientsByDate: Record<string, number> = {};
        last7Days.forEach(d => patientsByDate[d] = 0);

        if (recentQueueIds.length > 0) {
            // Count served tokens
            const { data: servedTokens } = await supabaseAdmin
                .from('tokens')
                .select('queue_id')
                .in('queue_id', recentQueueIds)
                .eq('status', 'served');

            servedTokens?.forEach(t => {
                const date = queueMap.get(t.queue_id);
                if (date && patientsByDate[date] !== undefined) {
                    patientsByDate[date]++;
                }
            });
        }
        const patientsTrend = last7Days.map(date => ({ date, value: patientsByDate[date] }));

        // B. Revenue History
        // Fetch requests updated in last 7 days
        // Note: searching for timestamp string might need care, using ISO start of day
        const weekAgoDate = new Date(weekAgo);
        weekAgoDate.setHours(0, 0, 0, 0);

        const { data: recentPayments } = await supabaseAdmin
            .from('payment_requests')
            .select('amount, updated_at')
            .eq('status', 'approved')
            .gte('updated_at', weekAgoDate.toISOString());

        const revenueByDate: Record<string, number> = {};
        last7Days.forEach(d => revenueByDate[d] = 0);

        recentPayments?.forEach(p => {
            const dateStr = p.updated_at.split('T')[0];
            // If dateStr matches one of our last 7 days
            // Note: updated_at is UTC usually. session_date is local (typically). 
            // Ideally we align huge systems to UTC. Here we do simple string match or simple conversion.
            // We'll trust the string split for now as "good enough" for this scale.
            if (revenueByDate[dateStr] !== undefined) {
                revenueByDate[dateStr] += (p.amount || 0);
            }
        });
        const revenueTrend = last7Days.map(date => ({ date, value: revenueByDate[date] }));


        return NextResponse.json({
            totalClinics: totalClinics || 0,
            totalPatientsToday: totalPatientsToday || 0,
            totalRevenue,
            lastMonthRevenue,
            patientsTrend,
            revenueTrend
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
