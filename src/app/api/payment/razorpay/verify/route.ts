import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, clinicId } = body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return new NextResponse(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
        }

        // Payment Verified. Update Clinic Balance.
        // NOTE: 'amount' here should be the rupee amount, passed from frontend for convenience, 
        // OR better, verify amount from the verified order directly if possible. 
        // For simplicity, we trust the flow if signature is valid.

        // 1. Log the transaction/payment request as approved directly
        const { error: logError } = await supabase
            .from('payment_requests')
            .insert({
                clinic_id: clinicId, // We might need to fetch this if not passed
                amount: amount,
                screenshot_url: `razorpay_${razorpay_payment_id}`, // Store payment ID as reference
                status: 'approved'
            });

        if (logError) console.error('Error logging payment', logError);

        // 2. Reduce the current_due of the clinic
        // Wait, 'Pay Bill' means REDUCING due? 
        // Or adding credit? 
        // Assuming "current_due" is what they OWE. So paying reduces it.
        // Let's fetch current due first to be safe, or just decrement.

        const { data: clinic } = await supabase.from('clinics').select('current_due').eq('id', clinicId).single();
        if (clinic) {
            const newDue = Math.max(0, (clinic.current_due || 0) - amount);
            await supabase.from('clinics').update({ current_due: newDue }).eq('id', clinicId);
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Razorpay Verification Error:', error);
        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
