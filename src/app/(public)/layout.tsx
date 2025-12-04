import { APP_NAME } from '@/lib/config';
import Link from 'next/link';
import { GlassNavbar } from '@/components/glass-navbar';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SmoothScroll } from '@/components/shared/SmoothScroll';

// The Footer is moved here
function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
          <Link href="/contact" className="hover:text-teal-400 transition-colors duration-200">Contact Us</Link>
          <a href="https://wa.me/+917001717263" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors duration-200">WhatsApp Link</a>
          <Link href="/terms" className="hover:text-teal-400 transition-colors duration-200">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-teal-400 transition-colors duration-200">Privacy Policy</Link>
        </div>
        <p className="text-slate-400">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}


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
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <GlassNavbar initialUser={user} initialRole={role} />
        <main className="flex-grow">
          {children}
        </main>
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
