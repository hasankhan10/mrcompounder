"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Linkedin,
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    ArrowRight
} from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { HowItWorksModal } from "./HowItWorksModal";

const footerLinks = {
    product: [
        { label: "How it Works", href: "#", isModal: true },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQs", href: "/#faqs" },
    ],
    company: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Reviews", href: "/reviews" },
    ],
    legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
    ]
};

export function SiteFooter() {
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

    return (
        <footer className="bg-slate-950 text-slate-400 py-12 relative overflow-hidden border-t border-white/5">
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative size-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-teal-500/20 transition-all duration-500">
                                <Image
                                    src="/favicon.ico"
                                    alt={APP_NAME}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {APP_NAME}
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Revolutionizing Indian healthcare waiting rooms with zero-friction automation.
                            Built for doctors who value their time and their patients' peace of mind.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://wa.me/+917001717263" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-teal-600 hover:border-teal-600 transition-all duration-300">
                                <MessageCircle className="size-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/mehedi-hasan110/" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300">
                                <Linkedin className="size-5" />
                            </a>
                            <a href="mailto:contact@mrcompounder.com" className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-600 hover:border-rose-600 transition-all duration-300">
                                <Mail className="size-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Product</h4>
                        <ul className="space-y-4">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    {link.isModal ? (
                                        <button
                                            onClick={() => setIsHowItWorksOpen(true)}
                                            className="hover:text-teal-400 transition-colors flex items-center group text-left w-full"
                                        >
                                            <ArrowRight className="size-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            {link.label}
                                        </button>
                                    ) : (
                                        <Link href={link.href} className="hover:text-teal-400 transition-colors flex items-center group">
                                            <ArrowRight className="size-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Company</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-teal-400 transition-colors flex items-center group">
                                        <ArrowRight className="size-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support/Contact */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Quick Support</h4>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="size-5 text-teal-500 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Call Us</p>
                                    <p className="text-white font-medium">+91 70017 17263</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="size-5 text-teal-500 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Based In</p>
                                    <p className="text-white font-medium">West Bengal, India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
                        {footerLinks.legal.map((link) => (
                            <Link key={link.label} href={link.href} className="text-xs hover:text-white transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <p className="text-xs text-slate-600">
                            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                        </p>
                        <p className="text-[10px] font-medium tracking-widest uppercase text-slate-700">
                            Designed & Developed with ❤️ by <a href="https://www.linkedin.com/in/mehedi-hasan110/" target="_blank" rel="noopener noreferrer" className="text-teal-500/50 text-xs hover:text-teal-400 transition-colors">Mehedi Hassan</a>
                        </p>
                    </div>
                </div>
            </div>

            <HowItWorksModal
                isOpen={isHowItWorksOpen}
                onClose={() => setIsHowItWorksOpen(false)}
            />
        </footer>
    );
}
