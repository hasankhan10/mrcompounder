'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarAuthProps {
    initialUser?: any;
    initialRole?: string | null;
}

export function NavbarAuth({ initialUser, initialRole }: NavbarAuthProps) {
    const [user, setUser] = useState<any>(initialUser || null);
    const [role, setRole] = useState<string | null>(initialRole || null);
    const [loading, setLoading] = useState(false);
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                router.refresh();
                return;
            }

            setUser(session?.user || null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                setRole(profile?.role || null);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleDashboardClick = () => {
        if (role === 'super_admin') {
            router.push('/admin');
        } else if (role === 'compounder') {
            router.push('/dashboard');
        }
    };

    if (loading) {
        return (
            <Button variant="ghost" className="text-gray-800 font-semibold" disabled>
                ...
            </Button>
        );
    }

    if (user) {
        return (
            <Button onClick={handleDashboardClick} variant="ghost" className="text-blue-600 cursor-pointer hover:bg-blue-50 font-bold border border-blue-100">
                Dashboard
            </Button>
        );
    }

    return (
        <>
            <Button asChild variant="ghost" className="text-gray-800 hover:bg-gray-200/50 font-semibold">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/50 border-gray-300 hover:bg-white text-gray-800 font-semibold">
                <Link href="/contact">Book Free Setup</Link>
            </Button>
        </>
    );
}
