// clinicline/src/app/(public)/about/page.tsx
import { APP_NAME } from '@/lib/config';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutUsPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-800 mb-4">
            Bringing Calm to Clinics, One Patient at a Time.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We are a team dedicated to solving real-world problems with simple, effective technology. We believe waiting for a doctor shouldn't be a stressful experience.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="prose lg:prose-lg max-w-none">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story: The <span className="font-bengali">"দাদা, এখন কার সিরিয়াল?"</span> Problem</h2>
            <p className='text-lg'>
              Anyone who has visited a local clinic in India knows the scene: a crowded room, a stressed compounder shouting names, and patients anxiously asking, "Is it my turn yet?". We've been there, and we knew there had to be a better way.
            </p>
            <p className='text-lg'>
              {APP_NAME} was born from this simple observation. We saw the chaos of paper tokens and notebooks and imagined a future where technology could create a calm, efficient, and respectful environment for everyone—staff, doctors, and most importantly, patients.
            </p>
            <p className='text-lg'>
              We didn't want to force a complex system. No app downloads, no complicated logins. Just a simple, web-based solution that works on the phones people already have in their pockets.
            </p>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Doctor with technology" className="rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Our Mission & Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-12">Our Mission & Values</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Simplicity First</h3>
              <p className="text-gray-600 text-lg">
                Technology should be an invisible helper, not a hurdle. Our platform is designed to be intuitive for everyone, from compounders to patients of all ages.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Reliability is Key</h3>
              <p className="text-gray-600 text-lg">
                Clinics are busy, critical environments. Our system is built to be robust and dependable, even with slow or unstable internet connections.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Meaningful Impact</h3>
              <p className="text-gray-600 text-lg">
                We are driven by the desire to make a tangible difference. Reducing stress, improving efficiency, and bringing order to the healthcare experience is our ultimate goal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Re-used from homepage for consistency) */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden text-white p-12 md:p-16">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to Join Us?</h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
                Help us transform the clinic experience across India. Get in touch to learn more or book a free setup for your clinic.
              </p>
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg md:text-xl font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
