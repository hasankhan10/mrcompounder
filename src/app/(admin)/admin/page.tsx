import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';
import { AdminClient } from './AdminClient';
import { getTodayIST } from '@/lib/date-utils';

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

  const todayStr = getTodayIST();

  // Parallel Fetching
  const [clinicsRes, queuesRes] = await Promise.all([
    supabaseAdmin
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('queues')
      .select('id, clinic_id')
      .eq('session_date', todayStr)
  ]);

  const clinics = clinicsRes.data || [];
  const queues = queuesRes.data || [];

  // Calculate Served Today
  const clinicCounts: Record<string, number> = {};

  if (queues.length > 0) {
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

  const clinicsWithStats = clinics.map((c) => ({
    ...c,
    served_today_count: clinicCounts[c.id] || 0,
  }));

  return (
    <AdminClient initialClinics={clinicsWithStats} />
  );
}
