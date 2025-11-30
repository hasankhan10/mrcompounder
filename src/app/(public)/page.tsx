import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

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


// The Navbar and Footer are now in the layout.tsx file,
// so this page only needs to render its specific content.
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-32 overflow-hidden">

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
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            End the Chaos. Bring Calm. <br /> {APP_NAME} for a Smarter Clinic.
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Replace shouting names with a simple, digital token system. Patients wait stress-free, staff manage effortlessly.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
              <Link href="/demo">Try Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 text-lg md:text-xl font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
              <Link href="/contact">Book Free Setup</Link>
            </Button>
          </div>

          {/* Simple Mockup Description */}
          <div className="mt-20 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-xs transform hover:scale-105 transition-transform duration-300">
              <div className="text-left text-gray-800">
                <p className="text-lg font-semibold text-blue-700">Clinic Name</p>
                <p className="text-sm text-gray-500 mb-4">Dr. Singh</p>
                <p className="text-5xl font-bold mb-2 text-blue-900">Current: B10</p>
                <p className="text-4xl font-bold text-green-600">Your Token: B12</p>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gray-200 rounded-b-lg"></div>
            </div>
            <div className="relative bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-center text-white mb-4">
                <p className="text-xl font-bold">Compounder Dashboard</p>
              </div>
              <ul className="text-left text-gray-200 text-sm space-y-2">
                <li><span className="font-semibold">B10</span> - Patient A (Called)</li>
                <li><span className="font-semibold">B11</span> - Patient B (Waiting)</li>
                <li><span className="font-semibold">B12</span> - Patient C (Waiting)</li>
              </ul>
              <div className="mt-6 flex justify-center space-x-4">
                <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Call Next</Button>
                <Button variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Break</Button>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gray-700 rounded-b-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-800 mb-12 animate-fade-in-up">How It Works (3 Simple Steps)</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover-lift animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl text-blue-500 mb-6 font-bold">1</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Scan & Join.</h3>
              <p className="text-gray-600 leading-relaxed">Patients scan your clinic's QR code, enter their phone number, and instantly get a live token on their own phone. No app needed.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl text-blue-500 mb-6 font-bold">2</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Call Next.</h3>
              <p className="text-gray-600 leading-relaxed">Your compounder sees the digital queue, taps "Call Next," and the system moves the line forward with a single click.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover-lift animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl text-blue-500 mb-6 font-bold">3</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Get Alerted.</h3>
              <p className="text-gray-600 leading-relaxed">Patients receive a clear in-page alert and web notification (if allowed) on their phone when it’s their turn. They return from anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Clinics Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-800 text-center mb-12">For Clinics: Your Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "No More Shouting: Quiet waiting areas, less stress for staff.",
              "Zero Crowd Congestion: Patients wait comfortably, even outside or in their car.",
              "Total Patient Freedom: Patients can leave and return when called.",
              "Fast Doctor Switching: Easily manage multiple doctors with separate sessions.",
              "Zero Hardware Needed: Works on existing smartphones and tablets.",
              "Simple & Universal: Works on any smartphone with a web browser."
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 flex items-start space-x-4 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Patients Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-800 text-center mb-12">For Patients: A Better Waiting Experience</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              "Live Token on Your Phone: Always know your turn and the current token number.",
              "Wait Anywhere, Comfortably: No need to stay confined to a crowded waiting room.",
              "Get Notified: Receive an alert when it’s almost your turn.",
              "Trust & Clarity: See the doctor's name on your screen, reducing confusion."
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-start space-x-4 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why India Needs This Section */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">Why India Needs {APP_NAME}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              "Works on Cheap Androids: Designed for accessibility across all devices.",
              "Low Internet Requirement: Optimized for intermittent or slower connections.",
              "Phone Number Identity: Familiar and trusted method for patient identification.",
              "Fits Clinic Workflows: Integrates seamlessly into how clinics already operate, enhancing efficiency."
            ].map((reason, index) => (
              <div key={index} className="p-6 rounded-xl border-2 border-blue-500 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <p className="text-lg font-medium">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-800 mb-12">Simple, Transparent Pricing</h2>
          <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
            <div className="filter select-none mb-6 opacity-50">
              <p className="text-5xl blur-sm font-extrabold text-green-600 mb-4">₹1</p>
              <p className="text-2xl text-gray-800 font-semibold">per patient served</p>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Our simple prepaid balance system means you only pay for what you use. No hidden fees, no complex subscriptions.
            </p>
            <div className="mb-8">
              <span className="inline-block bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full animate-pulse">
                🎉 14 Days Free Trial Included
              </span>
            </div>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-full">
              <Link href="/pricing">View Pricing Model</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-800 text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: "Do I need special hardware?", a: "No. " + APP_NAME + " works on any smartphone, tablet, or computer you already own." },
              { q: "Is there an app to download?", a: "No. It's entirely web-based, accessible directly through a browser." },
              { q: "What if the internet is slow or unstable?", a: APP_NAME + " is designed to be lightweight and resilient, providing a functional experience even with basic internet." },
              { q: "Can multiple doctors use it at the same time?", a: "Yes! You can easily start and manage separate 'sessions' for different doctors." },
              { q: "Can I pre-book patients for tomorrow?", a: "Absolutely. Your compounder can register patients in advance directly from the dashboard." }
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm transform hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Q: {item.q}</h3>
                <p className="text-gray-600 leading-relaxed">A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden text-white p-12 md:p-16">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to Modernize Your Clinic?</h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
                Transform your waiting room today. Join dozens of clinics who have brought calm and efficiency to their practice with {APP_NAME}.
              </p>
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg md:text-xl font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                <Link href="/contact">Book a Free Setup</Link>
              </Button>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
          </div>
        </div>
      </section>
    </>
  );
}
