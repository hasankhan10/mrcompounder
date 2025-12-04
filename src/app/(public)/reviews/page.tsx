'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Building2, User } from 'lucide-react';
import Image from 'next/image';
import { Reveal } from '@/components/shared/Reveal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/config';

// Dummy Data
const CLINIC_REVIEWS = [
    {
        id: 1,
        name: "Heart Care Center",
        location: "Mumbai, MH",
        logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop",
        rating: 5,
        comment: "MrCompounder has completely transformed our waiting room. We used to have chaos every morning, now it's silent and organized. The patients love tracking their turn from home.",
        date: "2 days ago"
    },
    {
        id: 2,
        name: "Little Smiles Clinic",
        location: "Bangalore, KA",
        logo: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?w=400&h=400&fit=crop",
        rating: 5,
        comment: "The best investment for my clinic. My staff is less stressed, and parents are happier because they don't have to wait in a crowded room with sick kids.",
        date: "1 week ago"
    },
    {
        id: 3,
        name: "City Health Clinic",
        location: "Delhi, DL",
        logo: "https://images.unsplash.com/photo-1601839777132-b3f4e455c369?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNsaW5pYyUyMHBpY3R1cmV8ZW58MHx8MHx8fDA%3D",
        rating: 4,
        comment: "Simple, effective, and affordable. The QR code system is genius. Setup took less than 10 minutes.",
        date: "2 weeks ago"
    }
];

const PATIENT_REVIEWS = [
    {
        id: 1,
        name: "Priya M.",
        location: "Mumbai",
        rating: 5,
        comment: "I love this system! I scanned the QR code, went to a nearby cafe, and came back exactly when it was my turn. No more waiting in line!",
        date: "Yesterday"
    },
    {
        id: 2,
        name: "Rahul S.",
        location: "Bangalore",
        rating: 5,
        comment: "Very convenient. I could see exactly how many people were ahead of me on my phone. Every clinic should have this.",
        date: "3 days ago"
    },
    {
        id: 3,
        name: "Anjali K.",
        location: "Delhi",
        rating: 4,
        comment: "Smooth experience. The live updates are accurate. Much better than the old token system.",
        date: "1 week ago"
    },
    {
        id: 4,
        name: "Vikram R.",
        location: "Chennai",
        rating: 5,
        comment: "Finally, a clinic that respects my time. Great technology.",
        date: "2 weeks ago"
    }
];

export default function ReviewsPage() {
    const [activeTab, setActiveTab] = useState<'clinics' | 'patients'>('clinics');

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                    <Reveal width="100%">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Trusted by Doctors <br />
                            <span className="text-teal-600">and Clinics.</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.1} width="100%">
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            See how Mr Compounder is changing healthcare experiences for everyone involved.
                        </p>
                    </Reveal>

                    {/* Toggle Switch */}
                    <Reveal delay={0.2} width="100%">
                        <div className="flex justify-center">
                            <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-slate-200 relative">
                                {/* Sliding Background */}
                                <motion.div
                                    className="absolute top-1.5 bottom-1.5 bg-teal-600 rounded-full shadow-md z-0"
                                    initial={false}
                                    animate={{
                                        left: activeTab === 'clinics' ? '6px' : '50%',
                                        width: 'calc(50% - 9px)',
                                        x: activeTab === 'clinics' ? 0 : 3
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />

                                <button
                                    onClick={() => setActiveTab('clinics')}
                                    className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'clinics' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <Building2 className="w-4 h-4" />
                                    By Clinics
                                </button>
                                <button
                                    onClick={() => setActiveTab('patients')}
                                    className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'patients' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    By Patients
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {activeTab === 'clinics' ? (
                        <motion.div
                            key="clinics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {CLINIC_REVIEWS.map((review, index) => (
                                <ReviewCard key={review.id} review={review} type="clinic" index={index} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="patients"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {PATIENT_REVIEWS.map((review, index) => (
                                <ReviewCard key={review.id} review={review} type="patient" index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Premium CTA Section */}
                <div className="mt-24">
                    <Reveal width="100%">
                        <div className="relative bg-teal-700 rounded-2xl shadow-xl overflow-hidden text-white p-12 md:p-16">
                            <div className="relative z-10 text-center">
                                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to Modernize Your Clinic?</h2>
                                <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
                                    Transform your waiting room today. Join dozens of clinics who have brought calm and efficiency to their practice with {APP_NAME}.
                                </p>
                                <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 text-lg md:text-xl font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                                    <Link href="/contact">Book a Free Setup</Link>
                                </Button>
                            </div>
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-1/4 -translate-y-1/4"></div>
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}

function ReviewCard({ review, type, index }: { review: any, type: 'clinic' | 'patient', index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full flex flex-col ${type === 'clinic' ? 'border-t-4 border-t-teal-500' : 'border-t-4 border-t-slate-300'}`}
        >
            <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                    />
                ))}
            </div>

            <div className="mb-6 flex-grow">
                <Quote className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-slate-700 leading-relaxed italic">
                    &quot;{review.comment}&quot;
                </p>
            </div>

            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-50">
                {type === 'clinic' ? (
                    <>
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                            <Image src={review.logo} alt={review.name} fill className="object-cover" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {review.location}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                            {review.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                            <p className="text-xs text-slate-500">{review.location}</p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
