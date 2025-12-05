import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { Reveal } from '@/components/shared/Reveal';

// New Component for the floating medical plus icon
function FloatingPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Plus
      className={`absolute text-white/10 animate-float ${className}`}
      style={style}
      strokeWidth={3}
    />
  );
}


import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Smart Queue Management',
  description: 'Replace shouting names with a simple, digital token system. Patients wait stress-free, staff manage effortlessly.',
  alternates: {
    canonical: '/',
  },
};

// The Navbar and Footer are now in the layout.tsx file,
// so this page only needs to render its specific content.
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-700 text-white py-20 md:py-32 overflow-hidden">

        {/* Container for floating icons */}
        <div className="absolute inset-0 z-0">
          <FloatingPlusIcon className="top-1/4 left-[5%] w-16 h-16" style={{ animationDelay: '0s' }} />
          <FloatingPlusIcon className="top-1/2 right-[10%] w-24 h-24" style={{ animationDelay: '2s' }} />
          <FloatingPlusIcon className="bottom-1/4 left-[15%] w-12 h-12" style={{ animationDelay: '4s' }} />
          <FloatingPlusIcon className="hidden md:block top-1/3 right-[25%] w-20 h-20" style={{ animationDelay: '1s' }} />
          <FloatingPlusIcon className="hidden md:block bottom-1/3 left-[30%] w-14 h-14" style={{ animationDelay: '3s' }} />

          {/* New icons added for better aesthetics */}
          <FloatingPlusIcon className="top-[10%] right-[40%] w-10 h-10" style={{ animationDelay: '1.5s' }} />
          <FloatingPlusIcon className="bottom-[10%] right-[5%] w-16 h-16" style={{ animationDelay: '3.5s' }} />
          <FloatingPlusIcon className="top-[80%] left-[45%] w-8 h-8 opacity-50" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg text-gray-200">
              End the Chaos. Bring Calm. <br /> {APP_NAME} for a Smarter Clinic.
            </h1>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.4}>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 text-white">
              Replace shouting names with a simple, digital token system. Patients wait stress-free, staff manage effortlessly.
            </p>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.6}>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                <Link href="/contact">Try Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-700 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                <Link href="/contact">Book Free Setup</Link>
              </Button>
            </div>
          </Reveal>

          {/* Simple Mockup Description */}
          <div className="mt-20 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-xs transform hover:scale-105 transition-transform duration-300">
              <div className="text-left text-slate-800">
                <p className="text-lg font-semibold text-teal-700">Clinic Name</p>
                <p className="text-sm text-slate-500 mb-4">Dr. Singh</p>
                <p className="text-5xl font-bold mb-2 text-slate-900">Current: B10</p>
                <p className="text-4xl font-bold text-green-600">Your Token: B12</p>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-slate-200 rounded-b-lg"></div>
            </div>
            <div className="relative bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-center text-white mb-4">
                <p className="text-xl font-bold">Compounder Dashboard</p>
              </div>
              <ul className="text-left text-slate-200 text-sm space-y-2">
                <li><span className="font-semibold">B10</span> - Patient A (Called)</li>
                <li><span className="font-semibold">B11</span> - Patient B (Waiting)</li>
                <li><span className="font-semibold">B12</span> - Patient C (Waiting)</li>
              </ul>
              <div className="mt-6 flex justify-center space-x-4">
                <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Call Next</Button>
                <Button variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Break</Button>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-slate-700 rounded-b-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-12 animate-fade-in-up">How It Works (3 Simple Steps)</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <Reveal delay={0.2} width="100%">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover-lift h-full">
                <div className="text-5xl text-teal-500 mb-6 font-bold">1</div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Scan & Join.</h3>
                <p className="text-slate-600 leading-relaxed">Patients scan your clinic&apos;s QR code, enter their phone number, and instantly get a live token on their own phone. No app needed.</p>
              </div>
            </Reveal>
            <Reveal delay={0.4} width="100%">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover-lift h-full">
                <div className="text-5xl text-teal-500 mb-6 font-bold">2</div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Call Next.</h3>
                <p className="text-slate-600 leading-relaxed">Your compounder sees the digital queue, taps &quot;Call Next,&quot; and the system moves the line forward with a single click.</p>
              </div>
            </Reveal>
            <Reveal delay={0.6} width="100%">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover-lift h-full">
                <div className="text-5xl text-teal-500 mb-6 font-bold">3</div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Get Alerted.</h3>
                <p className="text-slate-600 leading-relaxed">Patients receive a clear in-page alert and web notification (if allowed) on their phone when it&apos;s their turn. They return from anywhere.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>



      {/* For Patients Section */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-12">For Patients: A Better Waiting Experience</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              "Live Token on Your Phone: Always know your turn and the current token number.",
              "Wait Anywhere, Comfortably: No need to stay confined to a crowded waiting room.",
              "Get Notified: Receive an alert when it&apos;s almost your turn.",
              "Trust & Clarity: See the doctor's name on your screen, reducing confusion."
            ].map((benefit, index) => (
              <Reveal key={index} delay={index * 0.1} width="100%">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex items-start space-x-4 transition-all duration-300 h-full hover:shadow-lg">
                  <svg className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-lg text-slate-700">{benefit}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* For Clinic Owners Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-12">For Clinic Owners: The Business Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Increase Patient Retention", desc: "Patients who wait comfortably are 3x more likely to return and recommend your clinic.", icon: "📈" },
              { title: "Streamline Operations", desc: "Reduce front-desk workload by 40%. Let your staff focus on care, not crowd control.", icon: "⚡" },
              { title: "Real-time Analytics", desc: "Track daily footfall, peak hours, and doctor performance to optimize scheduling.", icon: "📊" },
              { title: "Premium Brand Image", desc: "Stand out as a modern, patient-centric facility in your neighborhood.", icon: "🏥" }
            ].map((item, index) => (
              <Reveal key={index} delay={index * 0.1} width="100%">
                <div className="flex items-start p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full hover:border-slate-200">
                  <div className="text-4xl mr-6 bg-teal-50 w-20 h-20 flex items-center justify-center rounded-2xl flex-shrink-0 shadow-inner">{item.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why India Needs This Section */}
      <section className="py-20 bg-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-gray-200">Why India Needs {APP_NAME}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              "Works on Cheap Androids: Designed for accessibility across all devices.",
              "Low Internet Requirement: Optimized for intermittent or slower connections.",
              "Phone Number Identity: Familiar and trusted method for patient identification.",
              "Fits Clinic Workflows: Integrates seamlessly into how clinics already operate, enhancing efficiency."
            ].map((reason, index) => (
              <div key={index} className="p-6 rounded-xl border-2 border-teal-500 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <p className="text-lg font-medium">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-12">Simple, Transparent Pricing</h2>
          <Reveal width="100%" delay={0.2}>
            <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
              <div className="filter select-none mb-6 opacity-50">
                <p className="text-5xl blur-sm font-extrabold text-green-600 mb-4">₹1</p>
                <p className="text-2xl text-slate-800 font-semibold">per patient served</p>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Our simple postpaid billing system means you use now and pay later. No hidden fees, no complex subscriptions.
              </p>
              <div className="mb-8">
                <span className="inline-block bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full animate-pulse">
                  🎉 14 Days Free Trial Included
                </span>
              </div>
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-3 px-8 rounded-full">
                <Link href="/pricing">View Pricing Model</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: "Do I need special hardware?", a: "No. " + APP_NAME + " works on any smartphone, tablet, or computer you already own." },
              { q: "Is there an app to download?", a: "No. It's entirely web-based, accessible directly through a browser." },
              { q: "What if the internet is slow or unstable?", a: APP_NAME + " is designed to be lightweight and resilient, providing a functional experience even with basic internet." },
              { q: "Can multiple doctors use it at the same time?", a: "Yes! You can easily start and manage separate 'sessions' for different doctors." },
              { q: "Can I pre-book patients for tomorrow?", a: "Absolutely. Your compounder can register patients in advance directly from the dashboard." }
            ].map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-6 bg-slate-50 shadow-sm transform hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Q: {item.q}</h3>
                <p className="text-slate-600 leading-relaxed">A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <Reveal width="100%">
            <div className="relative bg-teal-700 rounded-2xl shadow-xl overflow-hidden text-white p-12 md:p-16">
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gray-200">Ready to Modernize Your Clinic?</h2>
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
      </section>
    </>
  );
}
