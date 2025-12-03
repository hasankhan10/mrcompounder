import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/dashboard/reports
 * @summary Fetches report data for a specific month.
 * @param {string} month - Query param in YYYY-MM format.
 */
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // YYYY-MM

    if (!month) {
        return new NextResponse(JSON.stringify({ error: 'Month is required' }), { status: 400 });
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
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString();
    // End date is the first day of the NEXT month
    const endDate = new Date(year, monthNum, 1).toISOString();

    try {
        // 3. Fetch Data
        // We need tokens joined with queues to get doctor info
        const { data: tokens, error } = await supabase
            .from('tokens')
            .select(`
        *,
        queues (
          doctor_name,
          session_date
        )
      `)
            .eq('clinic_id', profile.clinic_id)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(tokens);

    } catch (error: unknown) {
        console.error('Error fetching report:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
