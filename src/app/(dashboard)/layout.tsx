// src/app/(dashboard)/layout.tsx

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server'; // Import the helper

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This will protect all routes under (dashboard)
    redirect('/login');
  }

  // Fetch the user's profile to check their role and clinic_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'compounder') {
    // Redirect non-compounders (or super_admins, who have their own route)
    redirect('/'); // Redirect to homepage or a different access denied page
  }

  // TODO: Potentially pass clinic_id down via context or directly to children
  // For now, we just ensure they are a compounder

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Could add a static sidebar or header here */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
