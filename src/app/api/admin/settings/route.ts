import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET() {
    const supabase = await createServerSupabaseClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // Check Admin
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { data: settings, error } = await supabaseAdmin
        .from('system_settings')
        .select('*');

    if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });

    // Convert array to object
    const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return NextResponse.json(settingsMap);
}

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Update loop
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
        updates.push(
            supabaseAdmin
                .from('system_settings')
                .upsert({ key, value: String(value), updated_at: new Date().toISOString() })
        );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
}
