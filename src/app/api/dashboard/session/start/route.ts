import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { StartSessionRequest, StartSessionResponse } from '@/lib/types';

// TODO: Implement authentication and authorization check for compounder
// TODO: Get clinic_id from user's session

/**
 * POST /api/dashboard/session/start
 * @summary Starts a new doctor session for the clinic
 * @tags Dashboard
 * @param {StartSessionRequest} request.body.required - The session start data
 * @return {StartSessionResponse} 201 - Created response
 * @return {object} 400 - Bad request (e.g., a session is already active)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body: StartSessionRequest = await request.json();

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

  // 3. Check for existing active/waiting session
  const { data: existingQueue } = await supabase
    .from('queues')
    .select('*')
    .eq('clinic_id', clinicId)
    .in('status', ['active', 'waiting', 'paused'])
    .maybeSingle();

  if (existingQueue) {
    return new NextResponse(JSON.stringify({ error: 'A session is already active or waiting.' }), { status: 400 });
  }

  // 4. Create New Queue
  const { data: newQueue, error } = await supabase
    .from('queues')
    .insert({
      clinic_id: clinicId,
      doctor_name: body.doctorName,
      doctor_image_url: body.doctorImageUrl,
      doctor_arrival_time: body.doctorArrivalTime,
      status: 'waiting', // Start in waiting mode
      session_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json(newQueue, { status: 201 });
}
