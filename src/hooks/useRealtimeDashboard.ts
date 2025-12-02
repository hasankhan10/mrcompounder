import { useEffect, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Clinic, Queue, Token } from '@/lib/types';
import { toast } from 'sonner';

interface UseRealtimeDashboardProps {
    supabase: SupabaseClient;
    clinic: Clinic | null;
    activeQueues: Queue[];
    selectedQueueId: string | null;
    setClinic: (clinic: Clinic) => void;
    setActiveQueues: (updater: (prev: Queue[]) => Queue[]) => void;
    setPastSessions: (updater: (prev: Queue[]) => Queue[]) => void;
    setTokens: (updater: (prev: Token[]) => Token[]) => void;
    router: AppRouterInstance;
    setSelectedQueueId: (id: string | null) => void;
}

export function useRealtimeDashboard({
    supabase,
    clinic,
    activeQueues,
    selectedQueueId,
    setClinic,
    setActiveQueues,
    setPastSessions,
    setTokens,
    router,
    setSelectedQueueId
}: UseRealtimeDashboardProps) {

    // Real-time subscription for clinic updates
    useEffect(() => {
        if (!clinic) return;

        const channel = supabase
            .channel('dashboard-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clinics',
                    filter: `id=eq.${clinic.id}`,
                },
                async (payload) => {
                    const updatedClinic = payload.new as Clinic;

                    // Check for deactivation
                    if (updatedClinic.is_active === false) {
                        await supabase.auth.signOut();
                        router.push('/login');
                        return;
                    }

                    // Update local state
                    setClinic(updatedClinic);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'queues',
                    filter: `clinic_id=eq.${clinic.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newQueue = payload.new as Queue;
                        if (newQueue.status !== 'ended') {
                            setActiveQueues(prev => {
                                if (prev.some(q => q.id === newQueue.id)) return prev;
                                return [newQueue, ...prev];
                            });
                        } else {
                            setPastSessions(prev => [newQueue, ...prev]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedQueue = payload.new as Queue;

                        if (updatedQueue.status === 'ended') {
                            // Move from active to history
                            setActiveQueues(prev => prev.filter(q => q.id !== updatedQueue.id));
                            setPastSessions(prev => {
                                const exists = prev.find(q => q.id === updatedQueue.id);
                                if (exists) return prev.map(q => q.id === updatedQueue.id ? updatedQueue : q);
                                return [updatedQueue, ...prev];
                            });

                            if (selectedQueueId === updatedQueue.id) {
                                setSelectedQueueId(null);
                                toast.info('Session ended.');
                            }
                        } else {
                            // Update active queue
                            setActiveQueues(prev => {
                                const exists = prev.find(q => q.id === updatedQueue.id);
                                if (exists) return prev.map(q => q.id === updatedQueue.id ? updatedQueue : q);
                                return [updatedQueue, ...prev];
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [clinic?.id, supabase, router, selectedQueueId]);

    // Real-time tokens subscription (Global for this clinic's active queues)
    const pendingUpdates = useRef<{ type: string, payload: any }[]>([]);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (activeQueues.length === 0) return;

        const processUpdates = () => {
            if (pendingUpdates.current.length === 0) return;

            const updates = [...pendingUpdates.current];
            pendingUpdates.current = []; // Clear queue

            setTokens((prev) => {
                let newTokens = [...prev];
                updates.forEach(update => {
                    if (update.type === 'INSERT') {
                        const newToken = update.payload.new as Token;
                        if (!newTokens.find(t => t.id === newToken.id)) {
                            newTokens.push(newToken);
                        }
                    } else if (update.type === 'UPDATE') {
                        const updatedToken = update.payload.new as Token;
                        newTokens = newTokens.map(t => t.id === updatedToken.id ? updatedToken : t);
                    } else if (update.type === 'DELETE') {
                        const deletedId = update.payload.old.id;
                        newTokens = newTokens.filter(t => t.id !== deletedId);
                    }
                });
                return newTokens;
            });
        };

        const channel = supabase
            .channel(`tokens-clinic-${clinic?.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tokens',
                    filter: `clinic_id=eq.${clinic?.id}`,
                },
                (payload) => {
                    // Push to queue
                    pendingUpdates.current.push({ type: payload.eventType, payload });

                    // Debounce
                    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                    debounceTimeout.current = setTimeout(processUpdates, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [clinic?.id, supabase, activeQueues.length]);
}
