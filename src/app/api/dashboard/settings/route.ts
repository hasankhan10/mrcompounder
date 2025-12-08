
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { logoUrl } = body;

        // Verify the user is a clinic (exists in clinics table with this email is not enough, better to use the user ID relation if available, but current schema links auth.users directly or via email. Let's assume clinic's id corresponds to something or we find the clinic by the auth user's email/id.)
        // **Project Context**: `clinics` table usually stores the `compounder_email`. Let's look up by that.
        // Actually, the previous implementation in `token/call-next` uses:
        // `const { data: clinic } = await supabase.from('clinics').select('id').eq('compounder_email', session.user.email).single();`

        const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .select('id')
            .eq('compounder_email', session.user.email)
            .single();

        if (clinicError || !clinic) {
            return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
        }

        // Update logic
        const { error: updateError } = await supabase
            .from('clinics')
            .update({ logo_url: logoUrl })
            .eq('id', clinic.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
