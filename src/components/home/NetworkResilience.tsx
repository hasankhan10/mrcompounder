"use client";

import { motion } from "framer-motion";
import { Smartphone, Signal, Phone, Zap, WifiOff } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const features = [
    {
        title: "Universal Access",
        desc: "Optimized for basic Android phones. If it has a browser, it works. No expensive hardware needed.",
        icon: <Smartphone className="size-6" />,
        delay: 0.1,
    },
    {
        title: "Network Resilient",
        desc: "Engineered for 2G/3G speeds. Patented polling logic keeps the queue live even on spotty data.",
        icon: <Signal className="size-6" />,
        delay: 0.2,
    },
    {
        title: "Trusted Identity",
        desc: "Uses simple phone numbers for ID. The most familiar and accessible method for every Indian.",
        icon: <Phone className="size-6" />,
        delay: 0.3,
    },
    {
        title: "Zero Friction",
        desc: "Instantly fits into your existing workflow. Staff learns it in 2 minutes, patients in 10 seconds.",
        icon: <Zap className="size-6" />,
        delay: 0.4,
    },
];

export function NetworkResilience() {
    return (
        <section className="py-24 bg-[#052c24] relative overflow-hidden">
            {/* Dynamic Background Grid */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Reveal width="100%" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-8">
                            <WifiOff className="size-3" /> Built for Bharat
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
                            Engineered for <br />
                            <span className="text-teal-400">Indian Internet Realities.</span>
                        </h2>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl text-teal-100/60 font-medium leading-relaxed">
                            We know OPDs can be anywhere. Our system is optimized for 2G/3G speeds
                            and works flawlessly on every budget smartphone in India.
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative"
                        >
                            {/* Card Glow Background */}
                            <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 rounded-[2rem] transition-colors duration-500" />

                            <div className="relative h-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-500">
                                {/* Shine Effect */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                                <div className="mb-8 size-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-400 group-hover:text-black transition-all duration-300">
                                    {feature.icon}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                                    {feature.title}
                                </h3>

                                <p className="text-teal-100/40 text-sm font-medium leading-relaxed group-hover:text-teal-100/70 transition-colors duration-500">
                                    {feature.desc}
                                </p>

                                {/* Interactive Shimmer on Hover */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust Badge */}
                <Reveal width="100%" direction="up" delay={0.6}>
                    <div className="mt-24 flex justify-center">
                        <div className="flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-lg">
                                🚀 High Bandwidth
                            </div>
                            <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-lg">
                                ⚡ Latency Optimized
                            </div>
                            <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-lg">
                                🔒 SSL Secured
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
