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
            .gte('created_at', today.toISOString());

        // Total Revenue (Sum of all top-ups from transactions)
        // If transactions table exists and is used.
        // Otherwise sum of current balances (which is not revenue, but "Outstanding Balance").
        // Let's try to sum 'amount' from 'transactions' where type='topup'.

        const { data: transactions } = await supabaseAdmin
            .from('transactions')
            .select('amount')
            .eq('type', 'topup');

        const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

        // Last Month Revenue
        const firstDayLastMonth = new Date();
        firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
        firstDayLastMonth.setDate(1);
        firstDayLastMonth.setHours(0, 0, 0, 0);

        const lastDayLastMonth = new Date();
        lastDayLastMonth.setDate(0); // Last day of previous month
        lastDayLastMonth.setHours(23, 59, 59, 999);

        const { data: lastMonthTx } = await supabaseAdmin
            .from('transactions')
            .select('amount')
            .eq('type', 'topup')
            .gte('created_at', firstDayLastMonth.toISOString())
            .lte('created_at', lastDayLastMonth.toISOString());

        const lastMonthRevenue = lastMonthTx?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

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
