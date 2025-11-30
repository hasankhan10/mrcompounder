import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Delete Token
    const { error } = await supabase
        .from('tokens')
        .delete()
        .eq('id', id);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}
