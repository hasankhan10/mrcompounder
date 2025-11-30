import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CallNextRequest, CallNextResponse } from '@/lib/types';

// TODO: Implement authentication and authorization check for compounder
// TODO: Get clinic_id from user's session

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

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body: CallNextRequest = await request.json();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 2. Mark current token as served (if any)
  let servedToken = null;
  if (body.currentCalledTokenId) {
    const { data: served, error: servedError } = await supabase
      .from('tokens')
      .update({ status: 'served' })
      .eq('id', body.currentCalledTokenId)
      .select()
      .single();

    if (servedError) console.error('Error serving token:', servedError);
    servedToken = served;

    // BILLING LOGIC: Deduct ₹1 for served token
    if (served) {
      // 1. Get current balance AND trial status
      const { data: clinic } = await supabase
        .from('clinics')
        .select('prepaid_balance, trial_ends_at')
        .eq('id', served.clinic_id)
        .single();

      if (clinic) {
        const isTrialActive = clinic.trial_ends_at && new Date(clinic.trial_ends_at) > new Date();

        if (!isTrialActive) {
          const newBalance = (clinic.prepaid_balance || 0) - 1;

          // 2. Update balance
          await supabase
            .from('clinics')
            .update({ prepaid_balance: newBalance })
            .eq('id', served.clinic_id);

          // 3. Record transaction
          await supabase
            .from('transactions')
            .insert({
              clinic_id: served.clinic_id,
              amount: 1,
              type: 'usage',
              description: `Token #${served.token_number} served`,
              created_at: new Date().toISOString()
            });
        }
      }
    }
  }

  // 3. Find next waiting token
  const { data: nextToken } = await supabase
    .from('tokens')
    .select('*')
    .eq('queue_id', body.queueId)
    .eq('status', 'waiting')
    .order('token_number', { ascending: true })
    .limit(1)
    .single();

  if (!nextToken) {
    return NextResponse.json({
      message: 'Queue is empty',
      servedToken
    });
  }

  // 4. Mark next token as called
  const { data: calledToken, error: callError } = await supabase
    .from('tokens')
    .update({ status: 'called' })
    .eq('id', nextToken.id)
    .select()
    .single();

  if (callError) {
    return new NextResponse(JSON.stringify({ error: callError.message }), { status: 500 });
  }

  return NextResponse.json({
    servedToken,
    calledToken
  });
}
