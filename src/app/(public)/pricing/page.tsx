import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Plus, Zap, ShieldCheck, Heart, ArrowRight, HelpCircle } from 'lucide-react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Reveal } from '@/components/shared/Reveal';
import { CallToAction } from '@/components/ui/cta-3';

export const metadata: Metadata = {
    title: 'Pricing - Simple, Transparent & Honest',
    description: 'No subscriptions, no hidden fees. Pay only per patient served. 14-day free trial included.',
    alternates: {
        canonical: '/pricing',
    },
};

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
    { className: "top-1/2 right-[10%] w-24 h-24", delay: "2s" },
    { className: "bottom-1/4 left-[15%] w-12 h-12", delay: "4s" },
];

export default async function PricingPage() {
    const supabase = await createServerSupabaseClient();
    const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'cost_per_patient')
        .single();

    const price = setting?.value ? setting.value : '1';

    return (
        <div className="flex flex-col w-full bg-slate-50">
            {/* Hero Section */}
            <section className="relative pt-44 pb-32 md:pt-64 md:pb-48 bg-teal-700 overflow-hidden">
                {/* Floating Icons */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none">
                    {floatingPlusIcons.map((icon, idx) => (
                        <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
                    ))}
                </div>

                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <Reveal width="100%" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            <Sparkles className="size-3" /> Transparent Pricing
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            Pay Only When <br />
                            <span className="text-teal-200">Patients Are Served.</span>
                        </h1>
                    </Reveal>
                    <Reveal width="100%" direction="up" delay={0.2}>
                        <p className="text-xl md:text-2xl text-teal-50/80 max-w-3xl mx-auto font-medium leading-relaxed">
                            No monthly subscriptions. No hidden setup fees. <br className="hidden md:block" />
                            Just complete transparency for your clinical growth.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 relative z-20">
                <div className="container mx-auto px-4">
                    <Reveal width="100%" direction="up" delay={0.3}>
                        <div className="max-w-4xl mx-auto">
                            <div className="relative group">
                                {/* Glow Effect Behind Card */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-[3rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                                <div className="relative bg-white border border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden">
                                    <div className="grid lg:grid-cols-2">
                                        {/* Left Side: Pricing Info */}
                                        <div className="p-12 md:p-16 flex flex-col justify-center bg-slate-50/50">
                                            <div className="inline-flex items-center gap-2 text-teal-600 font-bold uppercase tracking-widest text-xs mb-6">
                                                <Zap className="size-4" /> The Silent Plan
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 mb-6">Simple, Fair Billing</h2>

                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Pay As You Go</span>
                                            </div>

                                            <div className="space-y-4 mb-10">
                                                {[
                                                    "Custom Per-Patient Rate Tailored to Your Clinic",
                                                    "Unlimited Doctors & Staff",
                                                    "All Premium Features Included",
                                                    "14-Day Full Free Trial",
                                                    "No Monthly Subscriptions or Hidden Fees"
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="size-5 rounded-full bg-teal-500/10 flex items-center justify-center">
                                                            <CheckCircle2 className="size-3 text-teal-600" />
                                                        </div>
                                                        <span className="text-slate-600 font-bold text-sm tracking-tight">{item}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold h-14 rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95 transition-all w-full">
                                                <Link href="/contact" className="flex items-center gap-2 justify-center">
                                                    Book Free Setup & Custom Rate <ArrowRight className="size-5" />
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Right Side: Why it works */}
                                        <div className="p-12 md:p-16 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                                <ShieldCheck className="size-48" />
                                            </div>

                                            <div className="relative z-10 space-y-10">
                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-black tracking-tight">How it works</h3>
                                                    <p className="text-slate-400 font-medium leading-relaxed">
                                                        Run your OPD normally. Each clinic gets a custom per-patient rate agreed during onboarding. At the end of the month, we calculate tokens served at your specific rate.
                                                    </p>
                                                </div>

                                                <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                                    <p className="text-teal-400 font-bold text-lg">Real World Example:</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">20 patients × 25 days</span>
                                                            <span className="font-bold">500 total</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Custom Clinic Rate</span>
                                                            <span className="font-bold">e.g. ₹2.00 / patient</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-white/10 flex justify-between">
                                                            <span className="text-white font-bold">Actual Monthly Bill</span>
                                                            <span className="text-2xl font-black text-teal-400 tracking-tighter">₹1,000</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-slate-400 text-xs font-medium text-center">
                                                    * Billing happens once a month via UPI or Bank Transfer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Global FAQ Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Reveal width="100%" direction="up">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Common Questions</h2>
                            <p className="text-slate-500 font-medium">Everything you need to know about our billing and setup.</p>
                        </Reveal>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <Reveal width="100%" direction="up" delay={0.1}>
                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 text-teal-600">
                                    <HelpCircle className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">What if I don't pay the bill?</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    If a bill is generated and not cleared by the deadline, your account may be temporarily paused.
                                    However, we always reach out personally to resolve any billing issues before taking action.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal width="100%" direction="up" delay={0.2}>
                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-600">
                                    <ShieldCheck className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Is the setup really free?</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    Absolutely. We believe in our product. We will help you set up the QR codes,
                                    train your staff, and get your first OPD running without charging a single rupee upfront.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal width="100%" direction="up" delay={0.3}>
                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-600">
                                    <Heart className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Can I cancel anytime?</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    Yes. There are no long-term contracts. Since you only pay for what you use,
                                    you can stop using the system at any time if it doesn't fit your needs.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal width="100%" direction="up" delay={0.4}>
                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 text-teal-600">
                                    <Zap className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">What payment methods do you accept?</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    We accept all standard Indian payment methods including UPI (Google Pay, PhonePe),
                                    and direct Bank Transfers.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-24 bg-white">
                <div className="container mx-auto px-4">
                    <Reveal width="100%" direction="up">
                        <CallToAction
                            title="Ready for a silent OPD?"
                            description="Join 100+ clinics that have already transformed their patient experience. Start your free trial today."
                        />
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
