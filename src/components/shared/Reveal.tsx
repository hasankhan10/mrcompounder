'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, Variant } from 'framer-motion';

interface RevealProps {
    children: React.ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
}

export function Reveal({
    children,
    width = 'fit-content',
    delay = 0.25,
    duration = 0.5,
    direction = 'up',
    className = ''
}: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start('visible');
        }
    }, [isInView, mainControls]);

    const getVariants = (): { hidden: Variant; visible: Variant } => {
        const distance = 75;

        let initial = {};

        switch (direction) {
            case 'up':
                initial = { opacity: 0, y: distance };
                break;
            case 'down':
                initial = { opacity: 0, y: -distance };
                break;
            case 'left':
                initial = { opacity: 0, x: distance };
                break;
            case 'right':
                initial = { opacity: 0, x: -distance };
                break;
            case 'none':
                initial = { opacity: 0 };
                break;
        }

        return {
            hidden: initial,
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: { duration, delay, ease: "easeOut" }
            },
        };
    };

    return (
        <div ref={ref} style={{ position: 'relative', width }} className={className}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={mainControls}
                style={{ willChange: 'transform, opacity' }}
            >
                {children}
            </motion.div>
        </div>
    );
}
