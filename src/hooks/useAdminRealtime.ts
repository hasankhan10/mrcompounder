import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Clinic } from '@/lib/types';
import { adminService } from '@/services/admin';

interface UseAdminRealtimeProps {
    supabase: SupabaseClient;
    setClinics: (updater: (prev: Clinic[]) => Clinic[]) => void;
    setStats: (updater: (prev: any) => any) => void;
    setPaymentRequests: (updater: (prev: any[]) => any[]) => void;
    activeTab: string;
    fetchStats: (showLoading?: boolean) => Promise<void>;
    fetchClinicStats: () => Promise<void>;
}

export function useAdminRealtime({
    supabase,
    setClinics,
    setStats,
    setPaymentRequests,
    activeTab,
    fetchStats,
    fetchClinicStats
}: UseAdminRealtimeProps) {

    // Realtime Subscription for Clinics
    useEffect(() => {
        const channel = supabase
            .channel('admin-clinics-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clinics',
                },
                (payload) => {
                    const updatedClinic = payload.new as Clinic;
                    setClinics((prevClinics) =>
                        prevClinics.map((clinic) =>
                            clinic.id === updatedClinic.id ? { ...clinic, ...updatedClinic } : clinic
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, setClinics]);

    // Realtime Subscription for Stats (Tokens)
    useEffect(() => {
        const channel = supabase
            .channel('admin-stats-tokens')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tokens',
                    filter: 'status=eq.served'
                },
                (payload) => {
                    setStats(prev => ({
                        ...prev,
                        totalPatientsToday: prev.totalPatientsToday + 1
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, setStats]);

    // General Realtime Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel('admin-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'clinics' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setClinics((prev) => {
                            if (prev.some(c => c.id === payload.new.id)) return prev;
                            return [...prev, payload.new as Clinic];
                        });
                        fetchStats(false);
                    } else if (payload.eventType === 'UPDATE') {
                        setClinics((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Clinic) : c)));
                        fetchStats(false);
                    } else if (payload.eventType === 'DELETE') {
                        setClinics((prev) => prev.filter((c) => c.id !== payload.old.id));
                        fetchStats(false);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tokens' },
                () => {
                    fetchStats(false);
                    fetchClinicStats();
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'transactions' },
                () => {
                    fetchStats(false);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payment_requests' },
                () => {
                    fetchStats(false);
                    if (activeTab === 'payment-requests') {
                        adminService.fetchPaymentRequests()
                            .then(data => setPaymentRequests(() => data))
                            .catch(err => console.error(err));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, activeTab, fetchStats, fetchClinicStats, setClinics, setPaymentRequests]);
}
