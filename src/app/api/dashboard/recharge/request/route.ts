import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // 2. Get Clinic ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

    if (!profile?.clinic_id) {
        return new NextResponse(JSON.stringify({ error: 'Clinic not found' }), { status: 404 });
    }

    // 3. Insert Request
    const { data, error } = await supabase
        .from('payment_requests')
        .insert({
            clinic_id: profile.clinic_id,
            amount: body.amount,
            transaction_id: body.transactionId,
            screenshot_url: body.screenshotUrl,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return NextResponse.json(data);
}
