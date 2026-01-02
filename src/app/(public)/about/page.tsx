// clinicline/src/app/(public)/about/page.tsx
import { APP_NAME } from '@/lib/config';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Our Mission & Story',
  description: 'Learn about Mr Compounder, our mission to bring calm to clinics, and the team dedicated to improving healthcare experiences in India.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutUsPage() {
  return (
    <div className="bg-white text-slate-800">
      {/* Hero Section */}
      <section className="bg-teal-50 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
            Built From Real OPD Chaos, Not Theory.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
           Mr Compounder was built after seeing the same OPD problems every Indian clinic/Hospital/Nursing Home faces daily — crowding, shouting, confusion, and stress for staff and patients.
            We focus on one thing only: keeping OPD calm and predictable.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="prose lg:prose-lg max-w-none">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Story: The <span className="font-bengali">&quot;Which turn is right now?&quot;</span> Problem</h2>
            <p className='text-lg text-slate-700'>
              Anyone who has spent time inside an Indian clinic knows this moment:
              patients standing near the desk, someone asking “Which turn is right now?”,
              the compounder shouting names, and the waiting room slowly turning tense.
              We didn’t see this as a technology problem.
              We saw it as a flow problem.
              Paper tokens, notebooks, and shouting work — until the clinic gets busy.
              That’s when stress begins, mistakes happen, and trust drops.
              Mr Compounder was built to fix this exact moment.
              One queue. One button. One patient called at a time — calmly and clearly.
              No apps. No training sessions.
              Just a system that fits how clinics already work.
            </p>
            <p className='text-lg text-slate-700'>
              {APP_NAME} was born from this simple observation. We saw the chaos of paper tokens and notebooks and imagined a future where technology could create a calm, efficient, and respectful environment for everyone—staff, doctors, and most importantly, patients.
            </p>
            <p className='text-lg text-slate-700'>
              Clinics don’t need more software. They need less interruption. No app downloads, no complicated logins. Just a simple, web-based solution that works on the phones people already have in their pockets.
            </p>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Doctor with technology"
              width={600}
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Our Mission & Values Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12">Our Mission & Values</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">Simplicity First</h3>
              <p className="text-slate-600 text-lg">
                If a compounder needs training, the system has failed.
                Everything must work with minimal instruction during live OPD hours.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">Reliability Over Features</h3>
              <p className="text-slate-600 text-lg">
                OPD cannot stop because of software. Even with slow internet, patient flow must continue smoothly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-2xl font-semibold mb-4 text-slate-800">Respect for Everyone’s Time</h3>
              <p className="text-slate-600 text-lg">
               Doctors, staff, and patients all deserve a calmer experience. Reducing stress inside clinics is not optional — it’s essential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Re-used from homepage for consistency) */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-teal-700 rounded-2xl shadow-xl overflow-hidden text-white p-12 md:p-16">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gray-200">Want to See This Work in Your Clinic?</h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
                We’ll set it up once, guide your staff, and let you decide after real OPD usage. No pressure. No obligation.
              </p>
              <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 text-lg md:text-xl font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                <Link href="/contact">Book a Free Setup</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
