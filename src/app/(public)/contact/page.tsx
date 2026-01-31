"use client";

import { ContactForm } from '@/components/public/ContactForm';
import { Reveal } from '@/components/shared/Reveal';
import { Mail, MessageCircle, Phone, Sparkles, Plus, Clock } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

function FloatingPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Plus
      className={`absolute text-white/10 animate-float ${className}`}
      style={style}
      strokeWidth={3}
    />
  );
}

const floatingPlusIcons = [
  { className: "top-1/4 left-[5%] w-16 h-16", delay: "0s" },
  { className: "top-1/3 right-[10%] w-24 h-24", delay: "2s" },
  { className: "bottom-1/4 left-[15%] w-12 h-12", delay: "4s" },
];

export default function ContactUsPage() {
  return (
    <div className="flex flex-col w-full bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-32 bg-teal-700 overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {floatingPlusIcons.map((icon, idx) => (
            <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
          ))}
        </div>

        {/* Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <Reveal width="100%" direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-teal-100 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-8">
              <Sparkles className="size-3" /> Get in Touch
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
              How can we help <br />
              <span className="text-teal-200">your clinic today?</span>
            </h1>
          </Reveal>
          <Reveal width="100%" direction="up" delay={0.2}>
            <p className="text-xl md:text-2xl text-teal-50/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Whether you're looking for a free setup or have a specific question about patient flow, our team is here to help.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-start">

            {/* Direct Methods (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <Reveal width="100%" direction="left">
                <div className="space-y-4 mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Direct Contact</h2>
                  <p className="text-slate-500 font-medium">For immediate assistance, reach out via our official channels.</p>
                </div>
              </Reveal>

              <Reveal width="100%" direction="left" delay={0.1}>
                <a
                  href="https://wa.me/917001717263"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500"
                >
                  <div className="size-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">Recommended for clinics & doctors.</p>
                  <span className="text-teal-600 font-bold text-sm inline-flex items-center gap-1">
                    Chat with us <Plus className="size-3" />
                  </span>
                </a>
              </Reveal>

              <Reveal width="100%" direction="left" delay={0.2}>
                <a
                  href="mailto:mrcompounder.com@gmail.com"
                  className="group block p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500"
                >
                  <div className="size-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Mail className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">Response within 24 hours.</p>
                  <span className="text-teal-600 font-bold text-sm tracking-tight truncate block">
                    mrcompounder.com@gmail.com
                  </span>
                </a>
              </Reveal>

              <Reveal width="100%" direction="left" delay={0.3}>
                <div className="p-8 bg-slate-900 text-white rounded-[2rem] overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Clock className="size-12" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Operating Hours</h3>
                  <p className="text-slate-400 text-sm font-medium">Mon - Sat: 9 AM - 8 PM IST</p>
                </div>
              </Reveal>
            </div>

            {/* Form Column (8 cols) */}
            <div className="lg:col-span-8">
              <Reveal width="100%" direction="up" delay={0.4}>
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
                  <ContactForm />
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
