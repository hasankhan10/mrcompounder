import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

        // Total Patients Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: totalPatientsToday } = await supabaseAdmin
            .from('tokens')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'served')
            .gte('updated_at', today.toISOString());

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

    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
