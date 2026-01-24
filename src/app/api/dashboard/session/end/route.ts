import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();
  const { sessionId, shareToken } = body;

  let dbClient = supabase;

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!shareToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify share token matches the queue
    const { data: queue } = await supabaseAdmin
      .from('queues')
      .select('id')
      .eq('id', sessionId)
      .eq('share_token', shareToken)
      .maybeSingle();

    if (!queue) {
      return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
    }

    dbClient = supabaseAdmin;
  }

  // 2. Update Queue Status to 'ended'
  const { data: updatedQueue, error } = await dbClient
    .from('queues')
    .update({
      status: 'ended'
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(updatedQueue, { status: 200 });
}
