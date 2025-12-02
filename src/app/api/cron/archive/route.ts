import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic'; // Ensure this doesn't get cached

export async function GET() {
    try {
        // Optional: Add a secret check here if you use Vercel Cron
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        console.log('Starting token archiving...');

        const { data, error } = await supabaseAdmin.rpc('archive_old_tokens');

        if (error) {
            console.error('Archiving failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('Archiving result:', data);

        return NextResponse.json({
            success: true,
            message: data
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
