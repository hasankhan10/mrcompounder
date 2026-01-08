'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HowItWorksModal } from '@/components/shared/HowItWorksModal';

export function HeroActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                <Link href="/contact">Book Free Setup</Link>
            </Button>
            <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-700 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300"
            >
                See How It Works (2 min)
            </Button>

            <HowItWorksModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
