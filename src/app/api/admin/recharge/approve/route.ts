import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    const body = await request.json(); // { requestId, action: 'approve' | 'reject' }

    // Auth Check
    const { user, error: authError } = await requireSuperAdmin();
    if (authError) return authError;


    const { requestId, action } = body;

    // Fetch Request
    const { data: req, error: reqError } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (reqError || !req) return new NextResponse(JSON.stringify({ error: 'Request not found' }), { status: 404 });

    if (req.status !== 'pending') {
        return new NextResponse(JSON.stringify({ error: 'Request already processed' }), { status: 400 });
    }

    if (action === 'reject') {
        const { error } = await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', requestId);
        if (error) throw error;
        return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'approve') {
        // 1. Update Request Status
        const { error: updateError } = await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', requestId);
        if (updateError) throw updateError;

        // 2. Get Clinic Due
        const { data: clinic } = await supabaseAdmin
            .from('clinics')
            .select('current_due')
            .eq('id', req.clinic_id)
            .single();

        const newDue = (clinic?.current_due || 0) - req.amount;

        // 3. Update Clinic Due
        await supabaseAdmin
            .from('clinics')
            .update({ current_due: newDue })
            .eq('id', req.clinic_id);

        // 4. Create Transaction
        await supabaseAdmin
            .from('transactions')
            .insert({
                clinic_id: req.clinic_id,
                type: 'topup',
                amount: req.amount,
                balance_before: clinic?.current_due || 0,
                balance_after: newDue,
                description: `Approved Request #${requestId.slice(0, 8)}`,
                metadata: { request_id: requestId, approved_by: user.id }
            });

        return NextResponse.json({ success: true, status: 'approved' });
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
}
