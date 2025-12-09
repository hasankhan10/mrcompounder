import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { StartSessionRequest } from '@/lib/types';
import { z } from 'zod'; // Import zod

import { getTodayIST } from '@/lib/date-utils';

/**
 * POST /api/dashboard/session/start
 * @summary Starts a new doctor session for the clinic
 * @tags Dashboard
 * @param {StartSessionRequest} request.body.required - The session start data
 * @return {StartSessionResponse} 201 - Created response
 * @return {object} 400 - Bad request (e.g., a session is already active)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Define Zod schema for validation
const startSessionSchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorImageUrl: z.string().optional(),
  doctorArrivalTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // 1. Auth Check - Early return
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Parse and validate body
  let body: StartSessionRequest;
  try {
    const json = await request.json();
    const parsed = startSessionSchema.safeParse(json);
    if (!parsed.success) {
      return new NextResponse(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
    }
    body = parsed.data as StartSessionRequest;
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
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

  // 3. Check for Existing Active/Waiting Session FOR THE SAME DOCTOR
  // We allow multiple sessions for different doctors, but not for the same doctor at once.
  const { data: existingQueue } = await supabase
    .from('queues')
    .select('id, status')
    .eq('clinic_id', clinicId)
    .eq('doctor_name', body.doctorName) // Check by doctor name
    .in('status', ['active', 'waiting'])
    .maybeSingle();

  if (existingQueue) {
    return new NextResponse(JSON.stringify({
      error: `A session for Dr. ${body.doctorName} is already ${existingQueue.status}.`
    }), { status: 400 });
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
      session_date: getTodayIST(),
    })
    .select()
    .single();

  if (error) {
    console.error("Queue creation error:", error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create session' }), { status: 500 });
  }

  return NextResponse.json(newQueue, { status: 201 });
}
