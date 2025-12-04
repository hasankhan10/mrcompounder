'use client';

import { APP_NAME } from '@/lib/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavbarAuth } from '@/components/navbar-auth';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

interface GlassNavbarProps {
    initialUser?: User | null;
    initialRole?: string | null;
}

interface NavLinksProps {
    mobile?: boolean;
    pathname: string;
    setIsOpen: (open: boolean) => void;
}

function NavLinks({ mobile = false, pathname, setIsOpen }: NavLinksProps) {
    const isActive = (path: string) => pathname === path;

    return (
        <>
            <Link
                href="/"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/') ? 'text-teal-600 font-bold' : 'text-slate-700 hover:text-teal-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Home
            </Link>
            <Link
                href="/about"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/about') ? 'text-teal-600 font-bold' : 'text-slate-700 hover:text-teal-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                About Us
            </Link>
            <Link
                href="/contact"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/contact') ? 'text-teal-600 font-bold' : 'text-slate-700 hover:text-teal-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Contact Us
            </Link>
            <Link
                href="/pricing"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/pricing') ? 'text-teal-600 font-bold' : 'text-slate-700 hover:text-teal-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Pricing
            </Link>
        </>
    );
}

export function GlassNavbar({ initialUser, initialRole }: GlassNavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);



    return (
        <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-lg border-b border-slate-200/20 shadow-sm flex items-center justify-center">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src="/favicon.ico" alt={APP_NAME} width={40} height={40} className="h-10 w-auto rounded-xl" />
                        <span className="text-2xl font-bold text-slate-900 drop-shadow-sm">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLinks pathname={pathname} setIsOpen={setIsOpen} />
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavbarAuth initialUser={initialUser} initialRole={initialRole} />
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-700">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetTitle className="text-left text-xl font-bold mb-6">{APP_NAME}</SheetTitle>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <NavLinks mobile pathname={pathname} setIsOpen={setIsOpen} />
                                    <div className="h-px bg-slate-100 my-4" />
                                    <div className="flex flex-col space-y-3 items-start">
                                        <NavbarAuth initialUser={initialUser} initialRole={initialRole} />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
