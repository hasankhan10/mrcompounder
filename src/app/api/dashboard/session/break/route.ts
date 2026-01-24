import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ToggleBreakRequest, ToggleBreakResponse } from '@/lib/types';

// TODO: Implement authentication and authorization check for compounder
// TODO: Get clinic_id from user's session

/**
 * POST /api/dashboard/session/break
 * @summary Pauses or resumes the current doctor session
 * @tags Dashboard
 * @param {ToggleBreakRequest} request.body.required - The session break data
 * @return {ToggleBreakResponse} 200 - Success response
 * @return {object} 404 - Not Found (e.g., session not found)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body: ToggleBreakRequest = await request.json();

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

  // 3. Verify Session Ownership & Update
  // We strictly check that the queue (session) belongs to the clinic_id
  const { data: updatedQueue, error } = await supabase
    .from('queues')
    .update({ status: body.newStatus })
    .eq('id', body.sessionId)
    .eq('clinic_id', clinicId) // Security: Ensure ownership
    .select()
    .single();

  if (error) {
    console.error('Error updating session break status:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update session status' }), { status: 500 });
  }

  if (!updatedQueue) {
    return new NextResponse(JSON.stringify({ error: 'Session not found or permission denied' }), { status: 404 });
  }

  return NextResponse.json(updatedQueue);
}
