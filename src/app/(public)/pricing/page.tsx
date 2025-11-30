import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6">
                    Simple, Honest Pricing
                </h1>
                <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
                    No monthly subscriptions. No hidden fees. You only pay when you actually use the system to serve a patient.
                </p>

                <div className="bg-white p-12 rounded-3xl shadow-xl border border-blue-100 max-w-lg mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pay-As-You-Go</h2>
                        <div className="flex items-baseline justify-center gap-2 mt-6">
                            <span className="text-7xl font-extrabold text-green-600">₹1</span>
                            <span className="text-xl text-gray-500 font-medium">/ patient</span>
                        </div>
                        <p className="text-gray-500 mt-4 text-sm">Prepaid balance system. Top-up as needed.</p>
                    </div>

                    <div className="space-y-4 mb-10 text-left">
                        {[
                            "Unlimited Doctors & Staff",
                            "Unlimited alarm Alerts",
                            "14-Day Free Trial",
                            "Cancel Anytime (Refundable Balance)"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <Link href="/contact">Start Free Trial</Link>
                        </Button>
                        <p className="text-xs text-gray-400">No credit card required for setup.</p>
                    </div>
                </div>

                <div className="mt-20 grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">How do I pay?</h3>
                        <p className="text-gray-600">You recharge your clinic's wallet (like a prepaid SIM). ₹1 is deducted for each patient token generated.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">What if I have 0 balance?</h3>
                        <p className="text-gray-600">The system will pause new token generation until you top-up. We send alerts when your balance is low.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">Is the trial really free?</h3>
                        <p className="text-gray-600">Yes. We give you free credits to test the system for 14 days. No payment info needed upfront.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
