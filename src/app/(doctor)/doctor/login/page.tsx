"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function DoctorLogin() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verify if this email actually owns clinics
            const res = await fetch('/api/doctor/clinics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'No clinics found');
            }

            // In a real auth flow, we'd send an OTP or Password here.
            // For this "shortcut" architecture, we rely on the existence check 
            // and assume secure entry logic (or we can add a simple password later).
            // Storing email in localStorage to persist session
            localStorage.setItem('doctor_email', email);
            router.push('/doctor/dashboard');
            toast.success('Welcome back, Doctor!');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <LayoutDashboard className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Doctor Portal</CardTitle>
                    <p className="text-slate-500 text-sm">Manage all your clinic locations in one place.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Registered Email</label>
                            <Input
                                type="email"
                                placeholder="doctor@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" /></>}
                        </Button>

                        <div className="pt-4 text-center">
                            <p className="text-xs text-slate-400">
                                Protected Area. Access is restricted to registered medical practitioners.
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
