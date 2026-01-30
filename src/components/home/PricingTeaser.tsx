"use client";

import { motion } from "framer-motion";
import { PartyPopper, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";

interface PricingTeaserProps {
    price: string | number;
}

export function PricingTeaser({ price }: PricingTeaserProps) {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background radial gradients for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-100/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <Reveal width="100%" direction="up">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                            Pricing that Scales <br />
                            <span className="text-teal-600">With Your Volume.</span>
                        </h2>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl text-slate-500 font-medium">
                            No subscriptions. No hidden fees. Pay only for the patients you see.
                        </p>
                    </Reveal>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="relative group">
                        {/* Animated Glow Border */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-[3rem] blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-white border border-slate-100 rounded-[3rem] p-12 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                            {/* Feature Badge */}
                            <div className="absolute top-8 right-8 flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                                <Sparkles className="size-4 text-teal-600 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Fair Usage Price</span>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="mb-10">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <span className="text-3xl font-bold text-slate-400">₹</span>
                                        <span className="text-9xl font-black text-teal-600 tracking-tighter drop-shadow-sm select-none">
                                            {price}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 tracking-tight">Per Patient Served</p>
                                </div>

                                <div className="max-w-md mb-12 space-y-4">
                                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                        Tired of paying for expensive software that you barely use?
                                        Our "Pay-as-you-see" model ensures you only pay when you earn.
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-6">
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <ShieldCheck className="size-4 text-teal-600" /> No Fixed Costs
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <ShieldCheck className="size-4 text-teal-600" /> No Setup Fees
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <ShieldCheck className="size-4 text-teal-600" /> Cancel Anytime
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col items-center gap-6">
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-teal-50 text-green-700 text-xs font-black px-6 py-3 rounded-full border border-green-100 shadow-sm animate-bounce">
                                        <PartyPopper className="size-4" /> 14 DAYS FREE TRIAL INCLUDED
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                        <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold h-16 px-10 rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                                            <Link href="/pricing" className="flex items-center gap-2">
                                                View Detailed Pricing Model <ArrowRight className="size-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative light sweep */}
                            <div className="absolute top-0 -inset-x-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:animate-shimmer pointer-events-none" />
                        </div>
                    </div>
                </motion.div>

                {/* Comparison Note */}
                <div className="mt-16 text-center">
                    <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                        Average clinic saves over <strong className="text-slate-900">₹2,500/month</strong> compared to standard subscriptions.
                    </p>
                </div>
            </div>
        </section>
    );
}
