import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Get Clinic ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

    if (!profile?.clinic_id) {
        return new NextResponse(JSON.stringify({ error: 'Clinic not found' }), { status: 404 });
    }

    // 3. Fetch Recent Unique Doctors
    // We use a raw query or a distinct select to get unique doctors
    // Since Supabase JS client doesn't support DISTINCT ON easily with order, we might fetch a bit more and filter in JS or use RPC.
    // For simplicity and speed, let's fetch the last 50 sessions and deduplicate in JS.

    const { data: sessions, error } = await supabase
        .from('queues')
        .select('doctor_name, doctor_image_url, created_at')
        .eq('clinic_id', profile.clinic_id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Deduplicate by doctor_name
    const uniqueDoctors = new Map();
    sessions.forEach(session => {
        if (session.doctor_name && !uniqueDoctors.has(session.doctor_name)) {
            uniqueDoctors.set(session.doctor_name, {
                name: session.doctor_name,
                imageUrl: session.doctor_image_url
            });
        }
    });

    const recentDoctors = Array.from(uniqueDoctors.values()).slice(0, 5); // Return top 5

    return NextResponse.json(recentDoctors, { status: 200 });
}
