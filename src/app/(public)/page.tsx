import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { HeroActions } from '@/components/home/HeroActions';
import FaqSection from '@/components/shared/FaqSection';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import { MorphingText } from '@/components/ui/morphing-text';
import { CallToAction } from '@/components/ui/cta-3';
import { InteractiveMockup } from '@/components/home/InteractiveMockup';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ForPatients } from '@/components/home/ForPatients';
import { ForClinics } from '@/components/home/ForClinics';
import { NetworkResilience } from '@/components/home/NetworkResilience';
import { PricingTeaser } from '@/components/home/PricingTeaser';

function FloatingPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Plus
      className={`absolute text-white/10 animate-float ${className}`}
      style={style}
      strokeWidth={3}
    />
  );
}

export const metadata: Metadata = {
  title: 'Mr Compounder | Silent OPD System for Clinics & Hospitals',
  description: 'Stop OPD shouting. Simple patient flow control for Indian clinics. works on any Android phone. Pay only per patient.',
  alternates: {
    canonical: '/',
  },
};

const morphTexts = ['Clinics', 'Dr. Chambers', 'Hospitals', 'Nursing Homes'];

const floatingPlusIcons = [
  { className: "top-1/4 left-[5%] w-16 h-16", delay: "0s" },
  { className: "top-1/2 right-[10%] w-24 h-24", delay: "2s" },
  { className: "bottom-1/4 left-[15%] w-12 h-12", delay: "4s" },
  { className: "hidden md:block top-1/3 right-[25%] w-20 h-20", delay: "1s" },
  { className: "hidden md:block bottom-1/3 left-[30%] w-14 h-14", delay: "3s" },
  { className: "top-[15%] right-[40%] w-10 h-10", delay: "1.5s" },
  { className: "bottom-[10%] right-[5%] w-16 h-16", delay: "3.5s" },
  { className: "top-[80%] left-[45%] w-8 h-8 opacity-50", delay: "2.5s" },
];

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: setting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'cost_per_patient')
    .single();

  const price = setting?.value ? setting.value : '1';

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-700 text-white pt-44 pb-20 md:pt-64 md:pb-24 overflow-hidden">
        {/* Container for floating icons */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {floatingPlusIcons.map((icon, idx) => (
            <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-2 drop-shadow-lg text-gray-200">
              The Silent OPD System <br />for Busy Indian
            </h1>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.2}>
            <div className="flex justify-center mb-8">
              <MorphingText texts={morphTexts} className="text-teal-300 md:h-[1.2em] lg:text-[5rem]" />
            </div>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.4}>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 text-white leading-relaxed">
              Stop shouting names in your waiting room. Mr Compounder controls patient flow with a simple "Call Next" button. Patients get a ring, chaos stops, and your clinic becomes silent.
            </p>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.6}>
            <HeroActions />
          </Reveal>

          <InteractiveMockup />
        </div>
      </section>

      <HowItWorks />



      <ForPatients />

      <ForClinics />

      <NetworkResilience />

      <PricingTeaser price={price} />


      {/* FAQ Section */}
      <FaqSection />

      {/* Premium CTA Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <Reveal width="100%">
            <CallToAction />
          </Reveal>
        </div>
      </section>
    </>
  );
}
