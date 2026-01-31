"use client";

import { motion } from "framer-motion";
import { QrCode, Play, BellRing } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const steps = [
    {
        number: "01",
        title: "Instant Check-in",
        description: "Patients scan a QR code at your desk or staff enters their number. Token is assigned in 2 seconds. No apps, no downloads.",
        icon: <QrCode className="size-8" />,
        gradient: "from-teal-500/20 to-teal-400/5",
        iconColor: "text-teal-500",
    },
    {
        number: "02",
        title: "One-Click Call",
        description: "Staff hits the 'Call Next' button on any device. The system instantly sequences the queue and triggers the notification.",
        icon: <Play className="size-8" />,
        gradient: "from-teal-600/20 to-teal-500/5",
        iconColor: "text-teal-600",
    },
    {
        number: "03",
        title: "Phone Rings",
        description: "The patient's phone rings or vibrates. They enter the chamber calmly. Your entire OPD remains professionally silent.",
        icon: <BellRing className="size-8" />,
        gradient: "from-teal-700/20 to-teal-600/5",
        iconColor: "text-teal-700",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Reveal width="100%" direction="up">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
                            How it works: <br />
                            <span className="text-teal-600">Zero apps. Just rings.</span>
                        </h2>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            We replaced the chaos of shouting names with a sophisticated,
                            automated calling system that works on every patient's phone.
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Decorative Line (Desktop only) */}
                    <div className="hidden md:block absolute top-[20%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -12 }}
                            className="relative group z-10"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 h-full shadow-[0_8px_30px_rgb(0,0,0,0.02)] group-hover:shadow-[0_40px_80px_rgba(20,184,166,0.1)] transition-all duration-500 overflow-hidden">
                                {/* Step Number Background */}
                                <div className="absolute -top-6 -right-6 text-9xl font-black text-slate-50 opacity-[0.03] select-none">
                                    {step.number}
                                </div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`mb-10 w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center ${step.iconColor} group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl transition-all duration-500`}>
                                        {step.icon}
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-teal-600/50 mb-2 block">
                                            Step {step.number}
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                            {step.title}
                                        </h3>
                                    </div>

                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA for Section */}
                <Reveal width="100%" direction="up" delay={0.8}>
                    <div className="mt-24 text-center">
                        <div className="inline-flex flex-col items-center p-8 bg-teal-50 rounded-[2rem] border border-teal-100/50">
                            <p className="text-teal-800 font-bold mb-2">Designed for Indian clinics with zero learning curve.</p>
                            <p className="text-teal-600/70 text-xl font-medium italic">"It's like a calling bell for every patient's pocket."</p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
