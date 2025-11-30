import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'super_admin') {
    redirect('/dashboard');
  }

  // Fetch Clinics
  const { data: clinics } = await supabaseAdmin
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate Served Today
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Get queues for today
  const { data: queues } = await supabaseAdmin
    .from('queues')
    .select('id, clinic_id')
    .eq('session_date', todayStr);

  // 2. Get served tokens for these queues
  let clinicCounts: Record<string, number> = {};

  if (queues && queues.length > 0) {
    const queueIds = queues.map(q => q.id);
    const { data: tokens } = await supabaseAdmin
      .from('tokens')
      .select('queue_id')
      .in('queue_id', queueIds)
      .eq('status', 'served');

    tokens?.forEach((t) => {
      const q = queues.find((q) => q.id === t.queue_id);
      if (q && q.clinic_id) {
        clinicCounts[q.clinic_id] = (clinicCounts[q.clinic_id] || 0) + 1;
      }
    });
  }

  const clinicsWithStats = clinics?.map((c) => ({
    ...c,
    served_today_count: clinicCounts[c.id] || 0,
  }));

  return (
    <AdminClient initialClinics={clinicsWithStats || []} />
  );
}
