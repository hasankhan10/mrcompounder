// src/app/api/dashboard/dashboard-data/route.ts
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role, clinic_id').eq('id', user.id).single();
  if (!profile || profile.role !== 'compounder' || !profile.clinic_id) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden or no clinic associated' }), { status: 403 });
  }

  const clinicId = profile.clinic_id;

  // Fetch all data in parallel
  const [
    { data: clinic, error: clinicError },
    { data: activeQueue }
  ] = await Promise.all([
    supabase.from('clinics').select('*').eq('id', clinicId).single(),
    supabase.from('queues').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }).limit(1).single()
  ]);

  if (clinicError) return new NextResponse(JSON.stringify({ error: clinicError.message }), { status: 500 });

  if (!clinic.is_active) {
    return new NextResponse(JSON.stringify({ error: 'Clinic is inactive' }), { status: 403 });
  }

  // It's okay if queueError exists, it just means there's no active queue

  let waitingTokens = [];
  let servedTokens = [];

  if (activeQueue) {
    const { data: tokensData } = await supabase.from('tokens').select('*').eq('queue_id', activeQueue.id).order('token_number', { ascending: true });
    if (tokensData) {
      waitingTokens = tokensData.filter(token => token.status === 'waiting' || token.status === 'called');
      servedTokens = tokensData.filter(token => token.status === 'served' || token.status === 'no_show');
    }
  }

  const responseData = {
    clinic,
    activeQueue,
    waitingTokens,
    servedTokens,
    lowBalanceWarning: (clinic?.prepaid_balance || 0) < 10,
  };

  return NextResponse.json(responseData);
}
