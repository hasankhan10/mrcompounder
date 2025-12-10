import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { amount } = body;

        if (!amount || amount < 1) {
            return new NextResponse(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys missing in environment variables');
            return new NextResponse(JSON.stringify({ error: 'Server configuration error: Razorpay keys missing' }), { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create Order
        // Amount is in currency subunits (paise for INR). So 500 INR = 50000 paise.
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `rcpt_${Date.now().toString().slice(-10)}_${Math.random().toString(36).substring(2, 6)}`,
            notes: {
                userId: user.id,
                clinicId: body.clinicId // Optional: pass if needed
            }
        });

        return NextResponse.json(order);

    } catch (error: unknown) {
        console.error('Razorpay Order Creation Error:', error);

        // Razorpay specific error structure
        let message = 'Internal Server Error';
        if (error instanceof Error) {
            message = error.message;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errAny = error as any;
        if (errAny?.error?.description) {
            message = errAny.error.description;
        }

        return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
    }
}
