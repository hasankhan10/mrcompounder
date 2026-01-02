import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
    title: 'Pricing - Simple, Transparent & Honest',
    description: 'No subscriptions, no hidden fees. Pay only per patient served. 14-day free trial included.',
    alternates: {
        canonical: '/pricing',
    },
};

export default async function PricingPage() {
    const supabase = await createServerSupabaseClient();
    const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'cost_per_patient')
        .single();

    const price = setting?.value ? setting.value : '1';

    return (
        <div className="bg-slate-50 min-h-screen py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
                    Pay Only When Patients Are Served
                </h1>
                <p className="text-xl text-slate-600 mb-16 max-w-2xl mx-auto">
                    No monthly subscriptions. No setup fees. You only pay when you actually use the system to serve a patient.
                </p>

                <div className="bg-white p-12 rounded-3xl shadow-xl border border-teal-100 max-w-lg mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">One Simple Rule</h2>
                        <div className="flex items-baseline justify-center gap-1 mt-6">
                            <span className="text-5xl font-extrabold text-green-600">₹</span>
                            <span className="text-7xl font-extrabold text-green-600">{price}</span>
                            <span className="text-xl text-slate-500 font-medium">per patient served</span>
                        </div>
                        <p className="text-slate-500 mt-4 text-sm">Run OPD first. Pay after OPD usage. Billing happens once a month.</p>
                    </div>

                    <div className="space-y-4 mb-10 text-left">
                        {[
                            "Unlimited Doctors & Staff - no extra charge as your clinic grows",
                            "All features included",
                            "Free setup & guidance - we help your staff start smoothly",
                            "No Upfront Payment - decide after real OPD usage",
                            "14-day free trial included",
                            "100% Satisfaction",
                            "No hidden fees",
                            "No subscriptions"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-slate-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Button asChild size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <Link href="/contact">Book Free Setup</Link>
                        </Button>
                        <p className="text-xs text-slate-400">No credit card required for setup.</p>
                    </div>
                </div>

                <div className="mt-20 grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-2 text-slate-800">How do I pay?</h3>
                        <p className="text-slate-600 text-lg">At the end of the month, you should be making payment based on patients served. You can pay via UPI/Bank Transfer to clear dues.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-2 text-slate-800">What if I don't pay?</h3>
                        <p className="text-slate-600 text-lg">If the bill is not cleared by the deadline, your account may be temporarily paused until payment is made.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-2 text-slate-800">Is the trial really free?</h3>
                        <p className="text-slate-600 text-lg">Yes. You can use the full system for 14 days without generating any bill. It's completely on us.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-2 text-slate-800">What does this cost in real life?</h3>
                        <p className="text-slate-600 text-lg">
                            • 20 patients/day × 25 days ≈ ₹1,000/month. <br />
                            • That’s less than tea expenses in OPD <br />
                            • No patients → no bill
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
