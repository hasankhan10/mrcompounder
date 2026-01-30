"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, User, Bell, Play } from "lucide-react";

export function InteractiveMockup() {
    return (
        <div className="mt-24 relative flex flex-col items-center">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-400/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl px-4">
                {/* Patient View Card (Apple-style Glassmorphism) */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className="relative group w-full max-w-sm"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-teal-400/30 to-transparent rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                    <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <h4 className="text-teal-300 font-bold tracking-tight text-xl">Wellness Clinic</h4>
                                <p className="text-white/60 text-sm font-medium">Dr. Mehedi Hasan</p>
                            </div>
                            <div className="bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-2">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Live</span>
                            </div>
                        </div>

                        {/* Token Info */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Current Status</p>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black text-white tabular-nums drop-shadow-2xl">B10</span>
                                    <span className="text-white/30 text-lg line-through font-medium leading-none">B09</span>
                                </div>
                            </div>

                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-teal-300 text-sm font-bold uppercase tracking-widest">Your Turn</p>
                                    <Bell className="size-4 text-teal-400 animate-bounce" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-extrabold text-white">B12</span>
                                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: "80%" }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-teal-400"
                                        />
                                    </div>
                                </div>
                                <p className="text-white/40 text-xs mt-3 font-medium">~6 mins estimated wait time</p>
                            </motion.div>
                        </div>

                        {/* Bottom Notch Reflection */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-t-xl" />
                    </div>
                </motion.div>

                {/* Dashboard Card (Pro Glass Design) */}
                <motion.div
                    initial={{ opacity: 0, y: 60, rotateX: -5 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="relative group w-full max-w-lg"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] blur opacity-20" />

                    <div className="relative bg-[#0a0a0b]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Toolbar */}
                        <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="size-2.5 rounded-full bg-red-500/50" />
                                <div className="size-2.5 rounded-full bg-yellow-500/50" />
                                <div className="size-2.5 rounded-full bg-green-500/50" />
                            </div>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Compounder Pro v2.0</p>
                            <div className="size-6 rounded-full bg-white/5 flex items-center justify-center">
                                <Plus className="size-3 text-white/40" />
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-white font-bold text-lg">Next Patient</h3>
                                        <p className="text-white/40 text-xs italic font-medium">Auto-sequence active</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="size-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs ring-1 ring-teal-500/30">
                                                B11
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-bold">Rahim Ahmed</p>
                                                <p className="text-white/30 text-[10px]">Ready to enter</p>
                                            </div>
                                            <div className="size-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.5)]" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-extrabold h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-500/20">
                                            <Play className="size-4 mr-2 fill-current" />
                                            CALL NEXT
                                        </Button>
                                        <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5 font-bold h-10 rounded-xl">
                                            Take a Break
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Analytics</p>
                                        <User className="size-3 text-white/20" />
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Served", value: "42", color: "text-green-400" },
                                            { label: "Waiting", value: "18", color: "text-teal-400" },
                                            { label: "Avg Time", value: "4.2m", color: "text-white" }
                                        ].map((stat, idx) => (
                                            <div key={idx} className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <span className="text-white/40 text-[11px] font-medium">{stat.label}</span>
                                                <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Glass light sweep */}
                        <div className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent animate-shimmer" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
