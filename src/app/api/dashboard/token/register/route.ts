import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RegisterTokenRequest, RegisterTokenResponse } from '@/lib/types';

// TODO: Implement authentication and authorization check for compounder
// TODO: Get clinic_id from user's session

/**
 * POST /api/dashboard/token/register
 * @summary Manually registers a patient for the current session
 * @tags Dashboard
 * @param {RegisterTokenRequest} request.body.required - The patient registration data
 * @return {RegisterTokenResponse} 201 - Created response
 * @return {object} 400 - Bad request (e.g., low balance, no active session)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body: RegisterTokenRequest = await request.json();

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

  const clinicId = profile.clinic_id;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;

    // 3. Get Next Token Number
    const { data: lastToken } = await supabase
      .from('tokens')
      .select('token_number')
      .eq('queue_id', body.queueId)
      .order('token_number', { ascending: false })
      .limit(1)
      .single();

    const nextTokenNumber = (lastToken?.token_number || 0) + 1;

    // 4. Create Token
    const { data: newToken, error } = await supabase
      .from('tokens')
      .insert({
        clinic_id: clinicId,
        queue_id: body.queueId,
        phone: body.phone,
        patient_name: body.patientName,
        purpose: body.purpose,
        token_number: nextTokenNumber,
        status: 'waiting'
      })
      .select()
      .single();

    if (!error) {
      return NextResponse.json(newToken, { status: 201 });
    }

    // Check for Unique Violation (Postgres code 23505)
    if (error.code === '23505') {
      console.warn(`Duplicate token detected (Attempt ${attempts}). Retrying...`);
      continue;
    }

    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ error: 'Failed to generate unique token. Please try again.' }), { status: 409 });
}
