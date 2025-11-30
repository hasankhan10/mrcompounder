// src/app/(public)/[clinicSlug]/page.tsx

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Clinic, Queue, Token } from '@/lib/types';
import { PatientQueueClient } from './PatientQueueClient';

// Define the shape of our initial data
interface InitialData {
  clinic: Clinic | null;
  activeQueue: Queue | null;
}

// This is the main server component for the page.
// It fetches the initial, non-sensitive data required to render the page.
export default async function PatientPage(props: { params: Promise<{ clinicSlug: string }> }) {
  const params = await props.params;

  const { data: clinic } = await supabaseAdmin
    .from('clinics')
    .select('*')
    .eq('slug', params.clinicSlug)
    .single();

  let activeQueue: Queue | null = null;
  if (clinic) {
    const { data: queue } = await supabaseAdmin
      .from('queues')
      .select('*')
      .eq('clinic_id', clinic.id)
      .in('status', ['active', 'waiting', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    activeQueue = queue;
  }

  const initialData: InitialData = { clinic, activeQueue };

  // The server component passes the initial data to the client component,
  // which will handle all the interactive parts.
  return <PatientQueueClient initialData={initialData} />;
}
