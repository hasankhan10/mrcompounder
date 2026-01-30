import { APP_NAME } from '@/lib/config';
import Link from 'next/link';
import { GlassNavbar } from '@/components/glass-navbar';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SmoothScroll } from '@/components/shared/SmoothScroll';
import { ChatBot } from '@/components/shared/ChatBot';
import { SiteFooter } from '@/components/shared/SiteFooter';



export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || null;
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
        <GlassNavbar initialUser={user} initialRole={role} />
        <main className="flex-grow">
          {children}
        </main>
        <SiteFooter />
        <ChatBot />
      </div>
    </SmoothScroll>
  );
}
