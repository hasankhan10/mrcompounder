import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role, clinic_id').eq('id', user.id).single();

  if (!profile || profile.role !== 'compounder' || !profile.clinic_id) {
    if (profile?.role === 'super_admin') redirect('/admin');
    redirect('/');
  }

  const clinicId = profile.clinic_id;

  // Fetch all data in parallel
  const [
    { data: clinic },
    { data: activeQueues }
  ] = await Promise.all([
    supabase.from('clinics').select('*').eq('id', clinicId).single(),
    supabase.from('queues').select('*').eq('clinic_id', clinicId).neq('status', 'ended').order('created_at', { ascending: false })
  ]);

  if (!clinic) redirect('/');

  let allTokens: any[] = [];

  if (activeQueues && activeQueues.length > 0) {
    const queueIds = activeQueues.map((q: any) => q.id);
    const { data: tokensData } = await supabase.from('tokens').select('*').in('queue_id', queueIds).order('token_number', { ascending: true });
    if (tokensData) {
      allTokens = tokensData;
    }
  }

  return (
    <DashboardClient
      initialClinic={clinic}
      initialActiveQueues={activeQueues || []}
      initialTokens={allTokens}
      serverTime={new Date().toISOString()}
    />
  );
}