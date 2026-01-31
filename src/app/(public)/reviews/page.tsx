'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Building2, User, Sparkles, Plus } from 'lucide-react';
import Image from 'next/image';
import { Reveal } from '@/components/shared/Reveal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/config';
import { CallToAction } from '@/components/ui/cta-3';

// Dummy Data
const CLINIC_REVIEWS = [
    {
        id: 1,
        name: "Suroksha Diagnostics",
        location: "Barasat, Kolkata",
        logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop",
        rating: 5,
        comment: "We used to have 40-50 patients crowding the reception every evening. It was chaotic. With Mr Compounder, the waiting room is quiet, and patients just walk in when their number is up. It's a game changer for our administration.",
        date: "2 days ago"
    },
    {
        id: 2,
        name: "Dr. Sharma's Child Care",
        location: "Indiranagar, Bangalore",
        logo: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?w=400&h=400&fit=crop",
        rating: 5,
        comment: "Parents love that they don't have to expose their healthy kids to sick ones in the waiting area. They scan the QR, go wait in their car or a nearby cafe, and come back exactly on time. Best decision for my practice.",
        date: "1 week ago"
    },
    {
        id: 3,
        name: "City Polyclinic",
        location: "Vasant Kunj, Delhi",
        logo: "https://images.unsplash.com/photo-1601839777132-b3f4e455c369?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNsaW5pYyUyMHBpY3R1cmV8ZW58MHx8MHx8fDA%3D",
        rating: 4,
        comment: "Setup was surprisingly easy. We didn't need to buy any new computers; the compounder just uses his Android phone. The 'Call Next' feature is very responsive.",
        date: "2 weeks ago"
    },
    {
        id: 4,
        name: "LifeLine Ortho Centre",
        location: "Pune, MH",
        logo: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=400&fit=crop",
        rating: 5,
        comment: "My receptionist used to spend half her time answering 'How much longer?' Now the patients see it on their own phones. Efficiency has gone up by at least 40%.",
        date: "3 weeks ago"
    }
];

const PATIENT_REVIEWS = [
    {
        id: 1,
        name: "Ananya Roy",
        location: "Kolkata",
        rating: 5,
        comment: "Finally, a doctor's clinic that respects my time! I scanned the code, saw I was 10th in line, and went to finish my grocery shopping. Got a notification when it was my turn. Amazing.",
        date: "Yesterday"
    },
    {
        id: 2,
        name: "Rahul Verma",
        location: "Mumbai",
        rating: 5,
        comment: "No more fighting at the reception counter about who came first. The digital token number is clear and fair. Every clinic in Mumbai needs this.",
        date: "3 days ago"
    },
    {
        id: 3,
        name: "Sneha K.",
        location: "Bangalore",
        rating: 4,
        comment: "Very convenient. I didn't have to download any app, which is great. The live status page updates instantly.",
        date: "1 week ago"
    },
    {
        id: 4,
        name: "Vikram Singh",
        location: "Jaipur",
        rating: 5,
        comment: "I took my elderly mother to the clinic. It was so helpful that she didn't have to sit in the uncomfortable waiting chairs for 2 hours. We waited at home and left only when the token reached 5.",
        date: "2 weeks ago"
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

export default function ReviewsPage() {
    const [activeTab, setActiveTab] = useState<'clinics' | 'patients'>('clinics');

    return (
        <div className="flex flex-col w-full bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-44 pb-32 md:pt-64 md:pb-48 bg-teal-700 overflow-hidden">
                {/* Floating Icons */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none">
                    {floatingPlusIcons.map((icon, idx) => (
                        <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
                    ))}
                </div>

                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <Reveal width="100%" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            <Sparkles className="size-3" /> Testimonials
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            Trusted by Doctors <br />
                            <span className="text-teal-200">and Patients.</span>
                        </h1>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl md:text-2xl text-teal-50/80 max-w-3xl mx-auto font-medium leading-relaxed">
                            See how {APP_NAME} is restoring peace to waiting rooms across India, one clinic at a time.
                        </p>
                    </Reveal>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                {/* Toggle Switch */}
                <div className="flex justify-center mb-16">
                    <Reveal width="fit-content" direction="up" delay={0.3}>
                        <div className="inline-flex bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white relative">
                            {/* Sliding Background */}
                            <motion.div
                                className="absolute top-2 bottom-2 bg-teal-700 rounded-[1.5rem] shadow-xl z-0"
                                initial={false}
                                animate={{
                                    left: activeTab === 'clinics' ? '8px' : '50%',
                                    width: 'calc(50% - 12px)',
                                    x: activeTab === 'clinics' ? 0 : 4
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => setActiveTab('clinics')}
                                className={`relative z-10 px-10 py-4 rounded-[1.5rem] text-sm font-black tracking-tight transition-colors duration-200 flex items-center gap-2 ${activeTab === 'clinics' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <Building2 className="w-4 h-4" />
                                For Clinics
                            </button>
                            <button
                                onClick={() => setActiveTab('patients')}
                                className={`relative z-10 px-10 py-4 rounded-[1.5rem] text-sm font-black tracking-tight transition-colors duration-200 flex items-center gap-2 ${activeTab === 'patients' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                For Patients
                            </button>
                        </div>
                    </Reveal>
                </div>

                {/* Content Grid */}
                <div className="pb-24">
                    <AnimatePresence mode="wait">
                        {activeTab === 'clinics' ? (
                            <motion.div
                                key="clinics"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {CLINIC_REVIEWS.map((review, index) => (
                                    <ReviewCard key={review.id} review={review} type="clinic" index={index} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="patients"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {PATIENT_REVIEWS.map((review, index) => (
                                    <ReviewCard key={review.id} review={review} type="patient" index={index} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Premium CTA Section */}
                <div className="pb-24">
                    <Reveal width="100%" direction="up">
                        <CallToAction
                            title="Ready to Modernize Your Clinic?"
                            description={
                                <>
                                    Transform your waiting room today. Join dozens of clinics who have brought calm and efficiency to their practice with <span className="text-teal-600 font-bold">{APP_NAME}</span>.
                                </>
                            }
                            primaryBtnText="Book a Free Setup"
                            primaryBtnHref="/contact"
                            secondaryBtnText="See Pricing"
                            secondaryBtnHref="/pricing"
                        />
                    </Reveal>
                </div>
            </div>
        </div>
    );
}

function ReviewCard({ review, type, index }: { review: { rating: number; comment: string; logo?: string; name: string; location: string }; type: 'clinic' | 'patient'; index: number }) {
    return (
        <Reveal width="100%" direction="up" delay={index * 0.1}>
            <div className="group h-full bg-white rounded-[2.5rem] p-10 border border-slate-200 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500 flex flex-col">
                <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-teal-500 fill-teal-500' : 'text-slate-200'}`}
                        />
                    ))}
                </div>

                <div className="mb-8 flex-grow">
                    <Quote className="w-10 h-10 text-teal-500/10 mb-4 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-slate-700 text-lg leading-relaxed font-medium italic">
                        &quot;{review.comment}&quot;
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-auto pt-8 border-t border-slate-50">
                    {type === 'clinic' ? (
                        <>
                            <div className="relative size-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-110 duration-500">
                                <Image src={review.logo || '/placeholder-logo.png'} alt={review.name} fill className="object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 tracking-tight">{review.name}</h4>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {review.location}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="size-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-500">
                                {review.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 tracking-tight">{review.name}</h4>
                                <p className="text-sm text-slate-500 font-medium">{review.location}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Reveal>
    );
}
