"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw new Error(signInError.message || 'Could not sign in.');
            }

            if (!signInData.user) {
                throw new Error('Login failed, please try again.');
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, clinic_id')
                .eq('id', signInData.user.id)
                .single();

            if (profileError || !profile) {
                throw new Error('Could not retrieve user profile. Please contact support.');
            }

            // Redirect based on role
            if (profile.role === 'super_admin') {
                router.push('/admin');
            } else if (profile.role === 'doctor') {
                localStorage.setItem('doctor_email', email);
                router.push('/doctor/dashboard');
            } else if (profile.role === 'compounder') {
                if (!profile.clinic_id) {
                    await supabase.auth.signOut();
                    throw new Error('No clinic associated with this account.');
                }

                const { data: clinicData, error: clinicError } = await supabase
                    .from('clinics')
                    .select('is_active')
                    .eq('id', profile.clinic_id)
                    .single();

                if (clinicError || !clinicData) {
                    await supabase.auth.signOut();
                    throw new Error('Could not verify clinic status.');
                }

                if (!clinicData.is_active) {
                    await supabase.auth.signOut();
                    throw new Error('Your clinic account has been suspended. Please contact support.');
                }

                router.push('/dashboard');
            } else {
                router.push('/');
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                    <div className="size-12 rounded-2xl bg-teal-700 flex items-center justify-center shadow-2xl shadow-teal-700/20 group-hover:scale-110 transition-transform duration-500">
                        <Lock className="size-6 text-white" />
                    </div>
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                <p className="text-slate-500 font-medium tracking-tight">Access your clinical dashboard securely.</p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <ShieldCheck className="size-32" />
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="size-4 text-slate-400 mr-2" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@clinic.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 pl-11 bg-slate-50 border-slate-100 focus:bg-white focus:ring-teal-500/20 transition-all rounded-2xl font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <Label htmlFor="password" title="Password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</Label>
                            <Link href="/forgot-password" title="Forgot password" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="size-4 text-slate-400" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-14 pl-11 pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:ring-teal-500/20 transition-all rounded-2xl font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                            <p className="text-sm text-rose-600 text-center font-bold tracking-tight">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 bg-teal-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-teal-700/20 hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-70"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Authenticating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 justify-center">
                                Sign In <ArrowRight className="size-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-500 font-medium text-sm">
                    New to Mr Compounder? <Link href="/contact" className="text-teal-600 font-bold hover:underline">Get a free setup</Link>
                </p>
            </div>
        </div>
    );
}
