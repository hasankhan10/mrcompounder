
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSuperAdmin } from '@/lib/auth-utils';

export async function GET() {
    const { error: authError } = await requireSuperAdmin();
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'cost_per_patient')
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return NextResponse.json({
        cost_per_patient: data?.value || '1'
    });
}

export async function POST(request: NextRequest) {
    const { error: authError } = await requireSuperAdmin();
    if (authError) return authError;

    try {
        const body = await request.json();
        const { cost_per_patient } = body;

        const { error } = await supabaseAdmin
            .from('system_settings')
            .upsert({
                key: 'cost_per_patient',
                value: cost_per_patient.toString()
            }, { onConflict: 'key' });

        if (error) {
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return new NextResponse(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    }
}
