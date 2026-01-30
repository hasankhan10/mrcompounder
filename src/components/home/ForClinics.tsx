"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, BarChart3, Building2, UserCheck, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const ownerFeatures = [
    {
        title: "Silent OPD Ambience",
        desc: "Transform your waiting area from a chaotic marketplace into a calm, professional diagnostic space.",
        icon: <Building2 className="size-6" />,
        color: "bg-blue-500",
    },
    {
        title: "Automated Sequencing",
        desc: "The system handles the turn logic. No more staff-patient arguments over who came first.",
        icon: <Zap className="size-6" />,
        color: "bg-teal-500",
    },
    {
        title: "Patient Loyalty+",
        desc: "Modern patients prefer organized clinics. Boost your reputation as a tech-savvy healthcare provider.",
        icon: <TrendingUp className="size-6" />,
        color: "bg-indigo-500",
    },
    {
        title: "Operational Efficiency",
        desc: "Your staff stops being crowd managers and starts focused coordination. Efficiency increases by 40%.",
        icon: <BarChart3 className="size-6" />,
        color: "bg-cyan-500",
    },
];

export function ForClinics() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Heading */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                    <div className="max-w-2xl">
                        <Reveal width="100%" direction="up">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                                Designed for Calm, <br />
                                <span className="text-teal-600">Professional Clinics.</span>
                            </h2>
                        </Reveal>
                        <Reveal width="100%" direction="up" delay={0.2}>
                            <p className="text-xl text-slate-500 font-medium">
                                Eliminate shouts, reduce staff burn-out, and provide a premium
                                experience that keeps patients coming back.
                            </p>
                        </Reveal>
                    </div>
                    <Reveal width="fit-content" direction="up" delay={0.4}>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="size-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="doctor" className="size-full object-cover" />
                                </div>
                            ))}
                            <div className="size-12 rounded-full border-4 border-white bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                500+
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {ownerFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex items-start gap-8 group p-6 rounded-[2rem] hover:bg-slate-50 transition-colors duration-500"
                        >
                            <div className={`size-16 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-xl shadow-${feature.color.split('-')[1]}-500/20 group-hover:rotate-6 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Note */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                    <div className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                        <UserCheck className="size-6 text-teal-600" /> Clinic Management Pro
                    </div>
                    <div className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                        <ShieldCheck className="size-6 text-teal-600" /> HIPAA Compliant Data
                    </div>
                    <div className="text-xl font-black text-slate-800 tracking-tighter">
                        Verified OPDs
                    </div>
                </div>
            </div>

        </section>
    );
}

