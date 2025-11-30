import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PatientJoinRequest, PatientJoinResponse } from '@/lib/types';

/**
 * POST /api/patient/join
 * @summary Allows a patient to join a clinic's queue
 * @tags Patient
 * @param {PatientJoinRequest} request.body.required - The patient join data
 * @return {PatientJoinResponse} 201 - Created response
 * @return {object} 400 - Bad request (e.g., no active session)
 * @return {object} 402 - Payment Required (e.g., clinic has low balance)
 */
export async function POST(request: NextRequest) {
  const body: PatientJoinRequest = await request.json();

  // Logic to:
  // 1. Find the clinic by clinicId and check its 'prepaid_balance'. If <= 0, return 402 error.
  // 2. Find the 'active' queue for the clinic. If none, return 400 error.
  // 3. Check if a token with the same phone number already exists for this queue.
  // 4. If not, create a new token.
  // 5. Return the token and queue info.
  console.log(`POST /api/patient/join hit with body:`, body);

  // Placeholder response
  const placeholderResponse: PatientJoinResponse = {
    token: {
      id: 'new-patient-token-uuid',
      clinic_id: body.clinicId,
      queue_id: 'active-queue-uuid',
      phone: body.phone,
      patient_name: body.patientName,
      token_number: 124, // Should be calculated
      status: 'waiting',
      created_at: new Date().toISOString(),
    },
    queue: {
      id: 'active-queue-uuid',
      clinic_id: body.clinicId,
      doctor_name: 'Dr. Active Session',
      status: 'active',
      session_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
  };

  return NextResponse.json(placeholderResponse, { status: 201 });
}
