import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/dashboard/token/call-next
 * @summary Calls the next patient in the queue
 * @tags Dashboard
 * @description Marks the current token as 'served' and the next 'waiting' token as 'called'.
 */

// Zod schema — all fields validated at runtime, not just TypeScript cast
const callNextSchema = z.object({
  queueId: z.string().uuid('Invalid queue ID'),
  currentCalledTokenId: z.string().uuid('Invalid token ID').optional(),
  targetTokenId: z.string().uuid('Invalid target token ID').optional(),
  shareToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // 1. Parse & validate body — prevents null/undefined creeping into DB queries
  let body: z.infer<typeof callNextSchema>;
  try {
    const json = await request.json();
    const parsed = callNextSchema.safeParse(json);
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

  // Determine which client to use: Standard (Auth) or Admin (Guest with shareToken)
  let dbClient = supabase;

  // 2. Auth Check
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, verify share token and scope it to the exact requested queue
  if (!user) {
    if (!body.shareToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Share token must match the EXACT queueId in the body — prevents cross-queue access
    const { data: queue } = await supabaseAdmin
      .from('queues')
      .select('id')
      .eq('id', body.queueId)
      .eq('share_token', body.shareToken)
      .maybeSingle();

    if (!queue) {
      return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
    }

    // AUTH SUCCESS AS GUEST — use admin client, but all queries remain scoped to body.queueId
    dbClient = supabaseAdmin;
  }

  // 3. Mark current token as served (if any)
  let servedToken = null;
  if (body.currentCalledTokenId) {
    const { data: served, error: servedError } = await dbClient
      .from('tokens')
      .update({ status: 'served', served_at: new Date().toISOString() })
      .eq('id', body.currentCalledTokenId)
      .eq('queue_id', body.queueId) // Extra scope: token must belong to the verified queue
      .select()
      .maybeSingle();

    if (servedError) console.error('Error serving token:', servedError);
    servedToken = served;

    // BILLING LOGIC: Add to current_due for served token
    if (served) {
      // 1. Get current balance AND trial status
      const { data: clinic } = await supabaseAdmin // Always use admin for billing writes
        .from('clinics')
        .select('current_due, trial_end_date')
        .eq('id', served.clinic_id)
        .maybeSingle();

      if (clinic) {
        const isTrialActive = clinic.trial_end_date && new Date(clinic.trial_end_date) > new Date();

        if (!isTrialActive) {
          // 2. Determine Cost Per Patient (Default 1)
          let costPerPatient = 1;
          const { data: setting } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'cost_per_patient')
            .single();

          if (setting?.value) {
            const parsed = parseFloat(setting.value);
            if (!isNaN(parsed)) costPerPatient = parsed;
          }

          const currentDue = clinic.current_due || 0;
          const newDue = currentDue + costPerPatient;

          // 3. Update current_due, scoped to the exact clinic
          await supabaseAdmin
            .from('clinics')
            .update({ current_due: newDue })
            .eq('id', served.clinic_id);
        }
      }
    }
  }

  // 4. Find next waiting token
  let nextToken = null;

  if (body.targetTokenId) {
    // MANUAL CALL MODE — scoped to the verified queue
    const { data: specificToken } = await dbClient
      .from('tokens')
      .select('*')
      .eq('id', body.targetTokenId)
      .eq('queue_id', body.queueId)
      .in('status', ['waiting', 'no_show'])
      .maybeSingle();

    nextToken = specificToken;
  } else {
    // AUTO NEXT MODE — scoped to the verified queue
    const { data: autoToken } = await dbClient
      .from('tokens')
      .select('*')
      .eq('queue_id', body.queueId)
      .eq('status', 'waiting')
      .order('is_emergency', { ascending: false, nullsFirst: false }) // Prioritize emergency
      .order('token_number', { ascending: true }) // Then FIFO
      .limit(1)
      .maybeSingle();

    nextToken = autoToken;
  }

  if (!nextToken) {
    return NextResponse.json({
      message: 'Queue is empty',
      servedToken,
    });
  }

  // 5. Mark next token as called
  const { data: calledToken, error: callError } = await dbClient
    .from('tokens')
    .update({ status: 'called', called_at: new Date().toISOString() })
    .eq('id', nextToken.id)
    .eq('queue_id', body.queueId) // Extra scope: confirm token belongs to this queue
    .select()
    .maybeSingle();

  if (callError) {
    return new NextResponse(JSON.stringify({ error: callError.message }), { status: 500 });
  }

  return NextResponse.json({
    servedToken,
    calledToken,
  });
}
