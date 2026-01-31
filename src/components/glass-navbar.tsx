"use client";

import { APP_NAME } from "@/lib/config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavbarAuth } from "@/components/navbar-auth";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GlassNavbarProps {
    initialUser?: User | null;
    initialRole?: string | null;
}

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Reviews", href: "/reviews" },
    { name: "Contact Us", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

export function GlassNavbar({ initialUser, initialRole }: GlassNavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "mx-auto max-w-7xl h-16 rounded-2xl pointer-events-auto transition-all duration-500",
                    "border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]",
                    scrolled
                        ? "bg-white/80 backdrop-blur-xl border-slate-200/50"
                        : "bg-white/40 backdrop-blur-md"
                )}
            >
                <div className="container mx-auto h-full px-6 flex items-center justify-between">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
                        <div className="relative size-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-teal-500/20 transition-all duration-500">
                            <Image
                                src="/favicon.ico"
                                alt={APP_NAME}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-xl",
                                        active ? "text-teal-600" : "text-slate-600 hover:text-teal-600 hover:bg-teal-50/50"
                                    )}
                                >
                                    {link.name}
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-teal-50 rounded-xl -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <NavbarAuth initialUser={initialUser} initialRole={initialRole} />
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden flex items-center gap-4">
                        <div className="h-8 w-px bg-slate-200" />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-teal-50 text-slate-900 transition-colors">
                                    <Menu className="size-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="w-full border-b border-slate-100 rounded-b-[2.5rem] p-0 overflow-hidden outline-none transform-gpu">
                                <div className="p-8 pt-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <SheetTitle className="text-2xl font-black tracking-tighter">{APP_NAME}</SheetTitle>
                                    </div>

                                    <div className="flex flex-col gap-2 mb-10">
                                        {navLinks.map((link, i) => (
                                            <motion.div
                                                key={link.href}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 + (i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        "block py-3 px-4 rounded-2xl text-lg font-bold transition-all",
                                                        pathname === link.href ? "bg-teal-50 text-teal-600" : "text-slate-700 active:bg-slate-50"
                                                    )}
                                                >
                                                    {link.name}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-slate-100 mb-10" />

                                    <div className="flex flex-col gap-4">
                                        <NavbarAuth
                                            initialUser={initialUser}
                                            initialRole={initialRole}
                                            onLinkClick={() => setIsOpen(false)}
                                        />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </motion.nav>
        </div>
    );
}
