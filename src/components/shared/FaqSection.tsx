'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

const faqs = [
    { q: "Do I need special hardware?", a: "No. " + APP_NAME + " works on any smartphone, tablet, or computer you already own." },
    { q: "Is there an app to download?", a: "No. It's entirely web-based, accessible directly through a browser. This means no updates to manage and instant access for your patients." },
    { q: "What if the system fails during OPD hours?", a: "OPD never stops because of software. If internet fails, staff continues normally. " + APP_NAME + " supports OPD — it never blocks it." },
    { q: "Can multiple doctors use it at the same time?", a: "Yes! You can easily start and manage separate 'sessions' for different doctors within the same clinic account." },
    { q: "Can I pre-book patients for tomorrow?", a: "Absolutely. Your compounder can register patients in advance directly from the dashboard, or patients can join the queue online if you enable remote joining." }
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((item, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-slate-800 pr-8">
                                    {item.q}
                                </h3>
                                <ChevronDown
                                    className={`w-6 h-6 text-teal-600 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
