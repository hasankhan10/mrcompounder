'use client';

import { APP_NAME } from '@/lib/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavbarAuth } from '@/components/navbar-auth';

interface GlassNavbarProps {
    initialUser?: any;
    initialRole?: string | null;
}

export function GlassNavbar({ initialUser, initialRole }: GlassNavbarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-lg border-b border-gray-200/20 shadow-sm flex items-center justify-center">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/favicon.ico" alt={APP_NAME} className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-gray-900 drop-shadow-sm">
                            {APP_NAME}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className={`font-medium transition-colors ${isActive('/about') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'}`}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className={`font-medium transition-colors ${isActive('/contact') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'}`}
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/pricing"
                            className={`font-medium transition-colors ${isActive('/pricing') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'}`}
                        >
                            Pricing
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NavbarAuth initialUser={initialUser} initialRole={initialRole} />
                    </div>
                </div>
            </div>
        </nav>
    );
}
