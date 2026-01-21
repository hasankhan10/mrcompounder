import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CallNextRequest } from '@/lib/types';

// Auth is handled via Supabase RLS and Server Client checks

/**
 * POST /api/dashboard/token/call-next
 * @summary Calls the next patient in the queue
 * @tags Dashboard
 * @description Marks the current token as 'served' and the next 'waiting' token as 'called'.
 * @param {CallNextRequest} request.body.required - The call next data
 * @return {CallNextResponse} 200 - Success response
 * @return {object} 400 - Bad request (e.g., queue is empty)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body: CallNextRequest = await request.json();

  // Determine which client to use: Standard (Auth) or Admin (Guest with shareToken)
  let dbClient = supabase;

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, check for share token
  if (!user) {
    if (!body.shareToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify share token matches the queue
    const { data: queue } = await supabaseAdmin
      .from('queues')
      .select('id')
      .eq('id', body.queueId)
      .eq('share_token', body.shareToken)
      .maybeSingle();

    if (!queue) {
      return new NextResponse(JSON.stringify({ error: 'Invalid access link' }), { status: 401 });
    }

    // AUTH SUCCESS AS GUEST -> Use Admin client to bypass RLS for this specific request
    dbClient = supabaseAdmin;
  }

  // 2. Mark current token as served (if any)
  let servedToken = null;
  if (body.currentCalledTokenId) {
    const { data: served, error: servedError } = await dbClient
      .from('tokens')
      .update({ status: 'served' })
      .eq('id', body.currentCalledTokenId)
      .select()
      .maybeSingle();

    if (servedError) console.error('Error serving token:', servedError);
    servedToken = served;

    // BILLING LOGIC: Deduct ₹1 for served token
    if (served) {
      // 1. Get current balance AND trial status
      const { data: clinic } = await dbClient
        .from('clinics')
        .select('current_due, trial_end_date')
        .eq('id', served.clinic_id)
        .maybeSingle();

      if (clinic) {
        const isTrialActive = clinic.trial_end_date && new Date(clinic.trial_end_date) > new Date();

        if (!isTrialActive) {

          // 2. Determine Cost Per Patient (Default 1)
          let costPerPatient = 1;
          const { data: setting } = await dbClient
            .from('system_settings')
            .select('value')
            .eq('key', 'cost_per_patient')
            .single();

          if (setting && setting.value) {
            const parsed = parseFloat(setting.value);
            if (!isNaN(parsed)) costPerPatient = parsed;
          }

          const currentDue = clinic.current_due || 0;
          const newDue = currentDue + costPerPatient;

          // 3. Update current_due
          await dbClient
            .from('clinics')
            .update({ current_due: newDue })
            .eq('id', served.clinic_id);

          // Transaction log removed for performance. 
          // Audit via 'tokens' table if needed.
        }
      }
    }
  }

  // 3. Find next waiting token
  // 3. Find next waiting token
  let nextToken = null;

  if (body.targetTokenId) {
    // MANUAL CALL MODE (Allow both waiting and absent/no_show patients)
    const { data: specificToken } = await dbClient
      .from('tokens')
      .select('*')
      .eq('id', body.targetTokenId)
      .eq('queue_id', body.queueId)
      .in('status', ['waiting', 'no_show'])
      .maybeSingle();

    nextToken = specificToken;
  } else {
    // AUTO NEXT MODE
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
      servedToken
    });
  }

  // 4. Mark next token as called
  const { data: calledToken, error: callError } = await dbClient
    .from('tokens')
    .update({ status: 'called' })
    .eq('id', nextToken.id)
    .select()
    .maybeSingle();

  if (callError) {
    return new NextResponse(JSON.stringify({ error: callError.message }), { status: 500 });
  }

  return NextResponse.json({
    servedToken,
    calledToken
  });
}
