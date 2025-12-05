'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface NavbarAuthProps {
    initialUser?: User | null;
    initialRole?: string | null;
    onLinkClick?: () => void;
}

export function NavbarAuth({ initialUser, initialRole, onLinkClick }: NavbarAuthProps) {
    const [user, setUser] = useState<User | null>(initialUser || null);
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

    const [isNavigating, setIsNavigating] = useState(false);

    const handleDashboardClick = () => {
        setIsNavigating(true);
        onLinkClick?.();
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

    if (user && role) {
        return (
            <Button onClick={handleDashboardClick} variant="ghost" className="text-black cursor-pointer hover:bg-teal-50 hover:text-teal-700 font-bold border border-teal-100" disabled={isNavigating}>
                {isNavigating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Dashboard
            </Button>
        );
    }

    return (
        <>
            <Button asChild variant="ghost" className="text-gray-800 border border-gray-300 hover:bg-teal-50 hover:text-teal-700 font-semibold" onClick={onLinkClick}>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/50 border-gray-300 hover:bg-teal-50 hover:text-teal-700 font-semibold" onClick={onLinkClick}>
                <Link href="/contact">Book Free Setup</Link>
            </Button>
        </>
    );
}
