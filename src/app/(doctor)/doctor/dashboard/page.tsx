"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Activity, LogOut, ArrowRight, Home, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

interface ClinicSummary {
    id: string;
    name: string;
    location: string;
    slug: string;
    waiting_count: number;
    is_active: boolean;
    location_stats?: {
        id: string;
        name: string;
        count: number;
    }[];
}

export default function DoctorDashboard() {
    const [supabase] = useState(() => createClient());

    const [clinics, setClinics] = useState<ClinicSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [doctorName, setDoctorName] = useState<string>('');
    const [greeting, setGreeting] = useState<string>('');

    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/login');
                return;
            }
            if (!user.email) {
                toast.error("User email is missing");
                return;
            }
            // setEmail(user.email); // Removed
            fetchClinics(user.email, user.id);
            setGreeting(getGreeting());
        };
        checkUser();
    }, [router, supabase]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const fetchClinics = async (doctorEmail: string, userId: string) => {
        try {
            const res = await fetch('/api/doctor/clinics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: doctorEmail, userId })
            });

            if (!res.ok) {
                // Determine if it's a 404 (No clinics) or other error
                // If 404, we just show empty list, don't force logout
                const data = await res.json();
                if (res.status === 404) {
                    setClinics([]);
                } else {
                    console.error("API Error:", data.error);
                }
                return;
            }

            const data = await res.json();
            setClinics(data.clinics);
            setDoctorName(data.doctorName || 'Doctor');
        } catch (error) {
            console.error(error);
            toast.error('Failed to load clinics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        toast.info('Logged out securely');
    };

    const handleImpersonate = (slug: string) => {
        window.open(`/${slug}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
                </div>
            </div>
        );
    }

    const totalPatients = clinics.reduce((acc, c) => acc + c.waiting_count, 0);
    const activeClinics = clinics.filter(c => c.is_active).length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{greeting}, {doctorName}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:flex gap-2 text-slate-600"
                            onClick={() => router.push('/')}
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </Button>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-slate-900">{doctorName}</p>
                            <p className="text-xs text-slate-500">Super Doctor</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white border-none shadow-sm shadow-slate-200">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 rounded-full bg-blue-50 text-blue-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Waiting</p>
                                <h3 className="text-3xl font-bold text-slate-900">{totalPatients}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-sm shadow-slate-200">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 rounded-full bg-green-50 text-green-600">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Locations</p>
                                <h3 className="text-3xl font-bold text-slate-900">{activeClinics} <span className="text-slate-300 text-xl font-normal">/ {clinics.length}</span></h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-lg font-bold text-slate-900">Your Locations</h2>

                {/* Clinics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinics.map((clinic) => (
                        <Card key={clinic.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800">{clinic.name}</CardTitle>
                                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-xs">{clinic.location || 'Unknown Location'}</span>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${clinic.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} title={clinic.is_active ? 'Online' : 'Offline'} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-6 space-y-4">
                                    {clinic.location_stats && clinic.location_stats.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Breakdown</p>
                                            {clinic.location_stats.map(stat => (
                                                <div key={stat.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-700">{stat.name}</span>
                                                    <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                                                        <span className="text-sm font-bold text-teal-600">{stat.count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                <span className="text-sm font-bold text-slate-900">Total Waiting</span>
                                                <span className="text-lg font-bold text-teal-700">{clinic.waiting_count}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Queue</p>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-4xl font-bold text-teal-600">{clinic.waiting_count}</span>
                                                <span className="text-sm text-slate-500">patients waiting</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full bg-slate-900 text-white font-medium group-hover:bg-teal-600 transition-colors"
                                    onClick={() => handleImpersonate(clinic.slug)}
                                >
                                    View Live Status <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {clinics.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No clinics found linked to this account.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
