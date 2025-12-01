'use client';

import { APP_NAME } from '@/lib/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavbarAuth } from '@/components/navbar-auth';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

interface GlassNavbarProps {
    initialUser?: any;
    initialRole?: string | null;
}

export function GlassNavbar({ initialUser, initialRole }: GlassNavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            <Link
                href="/"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Home
            </Link>
            <Link
                href="/about"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/about') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                About Us
            </Link>
            <Link
                href="/contact"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/contact') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Contact Us
            </Link>
            <Link
                href="/pricing"
                onClick={() => mobile && setIsOpen(false)}
                className={`font-medium transition-colors ${isActive('/pricing') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'} ${mobile ? 'text-lg py-2' : ''}`}
            >
                Pricing
            </Link>
        </>
    );

    return (
        <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-lg border-b border-gray-200/20 shadow-sm flex items-center justify-center">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/favicon.ico" alt={APP_NAME} className="h-10 w-auto rounded-xl" />
                        <span className="text-2xl font-bold text-gray-900 drop-shadow-sm">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLinks />
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavbarAuth initialUser={initialUser} initialRole={initialRole} />
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-700">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetTitle className="text-left text-xl font-bold mb-6">{APP_NAME}</SheetTitle>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <NavLinks mobile />
                                    <div className="h-px bg-gray-100 my-4" />
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
