"use client";

import { motion } from "framer-motion";
import { Check, Clock, MapPin, Bell, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const items = [
    {
        title: "Real-time Visibility",
        desc: "Know exactly how many people are ahead of you. No need to keep asking the staff 'Mera number kab aayega?'.",
        icon: <Clock className="size-6" />,
    },
    {
        title: "Freedom to Wait",
        desc: "Wait comfortably in your car, a nearby café, or even at home if you're close. Don't get stuck in a crowded waiting room.",
        icon: <MapPin className="size-6" />,
    },
    {
        title: "Audio & Visual Calls",
        desc: "Your phone rings or vibrates when it's your turn. Just like a personal VIP assistant calling you for your appointment.",
        icon: <Bell className="size-6" />,
    },
    {
        title: "Stress-Free Entry",
        desc: "Enter the chamber with confidence. No more confusion about who was next or which room to go to.",
        icon: <ShieldCheck className="size-6" />,
    },
];

export function ForPatients() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <Reveal width="100%" direction="up">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                            For Patients: <br />
                            <span className="text-teal-600">Less Waiting. Less Stress.</span>
                        </h2>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            We've redesigned the waiting experience to respect your time and health.
                            No crowding, no shouting, just a calm and organized visit.
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            className="group"
                        >
                            <div className="relative h-full bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
                                {/* Checkmark Badge */}
                                <div className="absolute top-8 right-8 size-8 bg-green-500 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 ease-out shadow-lg shadow-green-500/30">
                                    <Check className="size-4 stroke-[3]" />
                                </div>

                                <div className="flex flex-col h-full">
                                    <div className="mb-6 size-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                                        {item.icon}
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                                        {item.title}
                                    </h3>

                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Bottom Glass Glow */}
                                <div className="absolute -bottom-10 -right-10 size-32 bg-teal-400/5 rounded-full blur-2xl group-hover:bg-teal-400/20 transition-all duration-500" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Feature Pill */}
                <Reveal width="100%" direction="up" delay={0.6}>
                    <div className="mt-16 flex justify-center">
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">Privacy Protected: No public announcements.</span>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
