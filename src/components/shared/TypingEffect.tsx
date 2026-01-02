'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['Clinics', 'Dr. Chambers', 'Hospitals', 'Nursing Homes'];

export function TypingEffect() {
    const [index, setIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [step, setStep] = useState(0); // 0: typing, 1: pause, 2: vanish

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (step === 0) {
            // Typing phase
            if (displayText.length < words[index].length) {
                timeout = setTimeout(() => {
                    setDisplayText(words[index].slice(0, displayText.length + 1));
                }, 100);
            } else {
                // Finished typing, move to pause
                timeout = setTimeout(() => setStep(1), 2000);
            }
        } else if (step === 1) {
            // Pause phase - move to vanish
            setStep(2);
        } else if (step === 2) {
            // Vanish phase (handled by AnimatePresence exit)
            timeout = setTimeout(() => {
                setDisplayText('');
                setIndex((prev) => (prev + 1) % words.length);
                setStep(0);
            }, 1000); // Increased to let the vanish effect 'stay' and fully complete
        }

        return () => clearTimeout(timeout);
    }, [displayText, index, step]);

    return (
        <span className="inline-block relative text-left">
            <AnimatePresence mode="wait">
                {step !== 2 && (
                    <motion.span
                        key={words[index]}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            y: -20,
                            filter: 'blur(15px)',
                            scale: 0.9,
                            transition: { duration: 0.8, ease: "easeIn" }
                        }}
                        className="text-teal-300 inline-block font-extrabold whitespace-nowrap"
                    >
                        {displayText}
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 1] }}
                            className="inline-block w-[3px] md:w-[4px] h-[1em] bg-teal-400 ml-1 translate-y-[15%] shadow-[0_0_15px_rgba(45,212,191,0.6)]"
                        />
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
}
