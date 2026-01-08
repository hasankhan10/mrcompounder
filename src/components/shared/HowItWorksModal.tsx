'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

const steps = [
    {
        title: "Step 1: Patient booking",
        description: "Patients book their appointment through calling.",
        image: "/images/how-it-works/step-1.jpeg"
    },
    {
        title: "Step 2: Join the Queue",
        description: "No apps to download. Patients enter their phone number to get a digital token instantly by QR code scanning or click the link that is provided by the clinic.",
        image: "/images/how-it-works/step-2.jpeg"
    },
    {
        title: "Step 3: Clicking Next",
        description: "When it's their turn, the compounder clicks 'Call Next' and the patient gets a phone alert.",
        image: "/images/how-it-works/step-3.jpeg"
    },
    {
        title: "Step 4: Smart Notification",
        description: "The patient gets a phone alert when it's their turn.",
        image: "/images/how-it-works/step-4.jpeg"
    },
    {
        title: "Step 5: Silent OPD",
        description: "Your clinic stays calm and quiet. No shouting names, no crowded waiting areas.",
        image: "/images/how-it-works/step-5.jpeg"
    }
];

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 border-none bg-white overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative">
                    {/* Top Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            className="h-full bg-teal-600"
                        />
                    </div>

                    {/* Accessibility Headers */}
                    <div className="sr-only">
                        <DialogHeader>
                            <DialogTitle>How Mr Compounder Works</DialogTitle>
                            <DialogDescription>
                                A step-by-step guide to our silent OPD system.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Image Area */}
                    <div className="aspect-[16/10] relative bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative w-full h-full p-4"
                            >
                                <div className="relative w-full h-full">
                                    <Image
                                        src={steps[currentStep].image}
                                        alt={steps[currentStep].title}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 text-center space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h3 className="text-2xl font-bold text-slate-900">{steps[currentStep].title}</h3>
                                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                    {steps[currentStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="text-slate-500 hover:text-teal-600 gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" /> Back
                            </Button>

                            <div className="flex gap-1.5">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-teal-600 w-6' : 'bg-slate-200'}`}
                                    />
                                ))}
                            </div>

                            {currentStep === steps.length - 1 ? (
                                <Button
                                    onClick={onClose}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                                >
                                    Get Started
                                </Button>
                            ) : (
                                <Button
                                    onClick={nextStep}
                                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                                >
                                    Next <ChevronRight className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
