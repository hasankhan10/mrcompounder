import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/dashboard/session/end
 * @summary Ends a doctor session
 * @tags Dashboard
 */

// Zod schema — prevents undefined sessionId from matching all DB rows
const endSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  shareToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // 1. Parse & validate body
  let body: z.infer<typeof endSessionSchema>;
  try {
    const json = await request.json();
    const parsed = endSessionSchema.safeParse(json);
    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { sessionId, shareToken } = body;
  let dbClient = supabase;

  // 2. Auth Check
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Guest path: verify shareToken belongs to the exact session being ended
    if (!shareToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

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
  } else {
    // Authenticated path: verify the session belongs to the calling user's clinic
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profile?.clinic_id) {
      const { data: queueOwnership } = await supabase
        .from('queues')
        .select('id')
        .eq('id', sessionId)
        .eq('clinic_id', profile.clinic_id)
        .maybeSingle();

      if (!queueOwnership) {
        return new NextResponse(
          JSON.stringify({ error: 'Session not found or access denied' }),
          { status: 403 }
        );
      }
    }
  }

  // 3. End the session
  const { data: updatedQueue, error } = await dbClient
    .from('queues')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(updatedQueue, { status: 200 });
}
