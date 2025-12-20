
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { startOfDay, endOfDay, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

/**
 * GET /api/dashboard/reports
 * @summary Fetches report data for a specific period (daily, weekly, monthly).
 * @param {string} type - 'daily' | 'weekly' | 'monthly'
 * @param {string} value - The date value (YYYY-MM-DD, YYYY-Www, or YYYY-MM)
 */
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const value = searchParams.get('value');

    if (!type || !value) {
        return new NextResponse(JSON.stringify({ error: 'Type and Value are required' }), { status: 400 });
    }

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
    if (!profile?.clinic_id) {
        return new NextResponse(JSON.stringify({ error: 'Clinic not found' }), { status: 404 });
    }

    // 2. Calculate Date Range
    let startDate: Date;
    let endDate: Date;

    try {
        if (type === 'daily') {
            // value: YYYY-MM-DD
            const date = parseISO(value);
            startDate = startOfDay(date);
            endDate = endOfDay(date);
        } else if (type === 'weekly') {
            // value: YYYY-Www (ISO Week)
            // Handling HTML input type="week" format (e.g., 2023-W01)
            const [yearStr, weekStr] = value.split('-W');
            const year = parseInt(yearStr);
            const week = parseInt(weekStr);

            // Calculate start of week (Monday) from ISO week year
            const d = new Date(year, 0, 1 + (week - 1) * 7);
            const day = d.getDay();
            const diff = d.getDate() - day + (day == 0 ? -6 : 1);
            const weekStart = new Date(d.setDate(diff));

            startDate = startOfDay(weekStart);
            endDate = endOfWeek(weekStart, { weekStartsOn: 1 }); // Monday start
        } else if (type === 'monthly') {
            // value: YYYY-MM
            const date = parseISO(`${value}-01`);
            startDate = startOfMonth(date);
            endDate = endOfMonth(date);
        } else {
            return new NextResponse(JSON.stringify({ error: 'Invalid report type' }), { status: 400 });
        }
    } catch {
        return new NextResponse(JSON.stringify({ error: 'Invalid date format' }), { status: 400 });
    }

    try {
        // 3. Fetch Data
        const { data: tokens, error } = await supabase
            .from('tokens')
            .select(`
    *,
    queues(
        doctor_name,
        session_date
    )
        `)
            .eq('clinic_id', profile.clinic_id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString()) // Use lte for inclusive end of day
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(tokens);

    } catch (error: unknown) {
        console.error('Error fetching report:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
