"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import {
    Users,
    Target,
    Clock,
    Heart,
    Zap,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CallToAction } from "@/components/ui/cta-3";

const values = [
    {
        title: "Dignity First",
        desc: "We believe patients deserve a calm, respectful environment. Shouting names belongs in the past.",
        icon: <Heart className="size-6" />,
        color: "bg-rose-500/10 text-rose-500"
    },
    {
        title: "Simple for Everyone",
        desc: "If a compounder can't learn it in 2 minutes, it's too complex. We prioritize friction-less design.",
        icon: <Zap className="size-6" />,
        color: "bg-teal-500/10 text-teal-500"
    },
    {
        title: "Extreme Reliability",
        desc: "OPDs are high-pressure. Our system is built to work offline and on 2G networks without missing a beat.",
        icon: <ShieldCheck className="size-6" />,
        color: "bg-blue-500/10 text-blue-500"
    }
];

function FloatingPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <Plus
            className={`absolute text-white/10 animate-float ${className}`}
            style={style}
            strokeWidth={3}
        />
    );
}

const floatingPlusIcons = [
    { className: "top-1/4 left-[5%] w-16 h-16", delay: "0s" },
    { className: "top-1/2 right-[10%] w-24 h-24", delay: "2s" },
    { className: "bottom-1/4 left-[15%] w-12 h-12", delay: "4s" },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative pt-44 pb-32 md:pt-64 md:pb-48 bg-teal-700 overflow-hidden">
                {/* Container for floating icons */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none">
                    {floatingPlusIcons.map((icon, idx) => (
                        <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
                    ))}
                </div>

                {/* Background Glows and Decorative Elements */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <Reveal width="100%" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            <Sparkles className="size-3" /> Our Mission
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            Restoring Peace to <br />
                            <span className="text-teal-200">
                                Indian Healthcare.
                            </span>
                        </h1>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl md:text-2xl text-teal-50/80 max-w-3xl mx-auto font-medium leading-relaxed">
                            Mr Compounder was born out of a simple observation: Indian clinics are too loud.
                            We're on a mission to automate 1,000,000 waiting rooms, one silent OPD at a time.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Our Story / Philosophy */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <Reveal width="100%" direction="left">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-teal-500/5 rounded-3xl blur-2xl" />
                                <div className="relative aspect-square md:aspect-video lg:aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                                    <div className="absolute inset-0 flex items-center justify-center p-12">
                                        <div className="text-center space-y-4">
                                            <div className="size-20 mx-auto rounded-2xl bg-teal-600 flex items-center justify-center shadow-2xl shadow-teal-600/20">
                                                <Target className="size-10 text-white" />
                                            </div>
                                            <p className="text-slate-900 font-bold text-2xl tracking-tight">The "No-Shout" Policy</p>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Our guiding principle for every line of code we write.</p>
                                        </div>
                                    </div>
                                    {/* Abstract shapes for Apple vibe */}
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="size-24 rounded-full bg-blue-400/10 blur-xl" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <div className="size-32 rounded-full bg-teal-400/10 blur-xl" />
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <div className="space-y-8">
                            <Reveal width="100%" direction="up">
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                    Why we started <br />Mr Compounder.
                                </h2>
                            </Reveal>
                            <Reveal width="100%" direction="up" delay={0.2}>
                                <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
                                    <p>
                                        In most Indian clinics, the patient experience begins with stress—crowded rooms,
                                        repetitive shouting of names, and the anxiety of losing one's spot. Doctors, despite their
                                        brilliance, often work in environments that feel chaotic rather than clinical.
                                    </p>
                                    <p>
                                        We realized that the solution wasn't expensive hardware or complex ERP systems.
                                        It was a simple, accessible tool that works on the devices staff already have in
                                        their pockets.
                                    </p>
                                    <p>
                                        Today, Mr Compounder is the bridge between traditional healthcare and modern
                                        automation, ensuring that the only thing a patient hears in your clinic is your
                                        expert advice.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Reveal width="100%" direction="up">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Our Values</h2>
                            <p className="text-slate-500 font-medium">Small teams, big impact, and a focus on the details that matter.</p>
                        </Reveal>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, idx) => (
                            <Reveal key={idx} width="100%" direction="up" delay={idx * 0.1}>
                                <div className="group h-full bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500">
                                    <div className={`size-14 rounded-2xl ${value.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{value.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <Reveal width="100%" direction="up">
                        <CallToAction />
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
