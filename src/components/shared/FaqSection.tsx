'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { Reveal } from '@/components/shared/Reveal';

const faqs = [
    {
        q: "Do I need special hardware?",
        a: "Not at all. " + APP_NAME + " is designed to be hardware-agnostic. It works flawlessly on any smartphone, tablet, or laptop you already own. There's no need for expensive kiosks or specialized printers."
    },
    {
        q: "Is there an app for my patients to download?",
        a: "Absolutely not. We've eliminated that friction. Patients simply scan a QR code and the queue interface opens instantly in their mobile browser. No downloads, no sign-ups, no barriers to entry."
    },
    {
        q: "What if the internet is slow or fails?",
        a: "We've built " + APP_NAME + " to be resilient. Our lightweight architecture works even on 2G connections. If a complete outage occurs, your staff can continue manually; our system is a support tool, not a bottleneck."
    },
    {
        q: "Can multiple doctors share one account?",
        a: "Yes. You can manage multiple 'Sessions' simultaneously—one for each doctor or department. Each has its own independent queue, all controlled from a single master dashboard."
    },
    {
        q: "Can we pre-book patients?",
        a: "Yes. Your staff can easily add 'walk-in' patients or pre-registered patients directly into the queue. You can also enable remote joining so patients can book their slot before they even leave home."
    }
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faqs" className="py-24 bg-white relative overflow-hidden">
            {/* Subtle background element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <Reveal width="100%" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            <HelpCircle className="size-3" /> Questions & Answers
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
                            Got Questions? <br />
                            <span className="text-teal-600">We've Got Answers.</span>
                        </h2>
                    </Reveal>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                        {faqs.map((item, index) => (
                            <div key={index} className="py-2">
                                <motion.div
                                    initial={false}
                                    className="group"
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between py-8 text-left focus:outline-none group-hover:px-4 transition-all duration-300 rounded-[2rem] hover:bg-slate-50"
                                    >
                                        <h3 className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${openIndex === index ? 'text-teal-600' : 'text-slate-900 group-hover:text-teal-600'}`}>
                                            {item.q}
                                        </h3>
                                        <div className={`flex-shrink-0 size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${openIndex === index ? 'bg-teal-600 border-teal-600 text-white rotate-0' : 'border-slate-200 text-slate-400 rotate-90 group-hover:border-teal-600 group-hover:text-teal-600'}`}>
                                            {openIndex === index ? <Minus className="size-5" /> : <Plus className="size-5" />}
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-4 pb-10 text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
                                                    {item.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Support Link */}
                <Reveal width="100%" direction="up" delay={0.4}>
                    <div className="mt-24 text-center">
                        <p className="text-slate-400 font-medium italic">
                            Couldn't find what you were looking for?
                            <a href="/contact" className="ml-2 text-teal-600 font-bold hover:underline">Contact our support team</a>
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
