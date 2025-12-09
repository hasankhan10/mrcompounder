
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const settingsSchema = z.object({
    logoUrl: z.string().url('Invalid Logo URL').optional().or(z.literal('')),
});

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const json = await request.json();
        const parsed = settingsSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { logoUrl } = parsed.data;

        // Verify the user is a clinic
        // Use profile to get clinic_id, matching DashboardLayout logic
        const { data: profile } = await supabase
            .from('profiles')
            .select('clinic_id')
            .eq('id', session.user.id)
            .single();

        if (!profile || !profile.clinic_id) {
            return NextResponse.json({ error: 'Clinic not found for this user' }, { status: 404 });
        }

        const clinicId = profile.clinic_id;

        // Update logic
        const { error: updateError } = await supabase
            .from('clinics')
            .update({ logo_url: logoUrl })
            .eq('id', clinicId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
