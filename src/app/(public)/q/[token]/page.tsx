'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { guestService } from '@/services/guest';
import { Queue, Token } from '@/lib/types';
import { QueueDisplay } from '@/components/dashboard/QueueDisplay';
import { QueueDisplaySkeleton } from '@/components/skeletons/DashboardSkeletons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function GuestQueuePage() {
    const params = useParams();
    const token = params.token as string;

    const [isLoading, setIsLoading] = useState(true);
    const [queue, setQueue] = useState<Queue | null>(null);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const data = await guestService.fetchQueue(token);
            setQueue(data.queue);
            setTokens(data.tokens);
        } catch (err: any) {
            console.error('Error fetching guest queue:', err);
            setError(err.message || 'Failed to load queue. The link might be invalid or expired.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Auto-refresh every 30 seconds to keep tokens in sync if multiple people are looking
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const waitingTokens = useMemo(() =>
        tokens.filter(t => t.status === 'waiting' || t.status === 'called'),
        [tokens]);

    const servedTokens = useMemo(() =>
        tokens.filter(t => t.status === 'served'),
        [tokens]);

    const absentTokens = useMemo(() =>
        tokens.filter(t => t.status === 'no_show'),
        [tokens]);

    const handleCallNext = async (targetTokenId?: string) => {
        if (!queue) return;
        setLoadingAction('call-next');
        try {
            const currentCalled = tokens.find(t => t.status === 'called');
            const result = await guestService.callNext(
                queue.id,
                token,
                currentCalled?.id,
                targetTokenId
            );

            // Optimistic update or just refetch
            await fetchData();

            if (result.message === 'Queue is empty') {
                toast.info('No more patients in the queue.');
            } else {
                toast.success(targetTokenId ? 'Patient recalled!' : 'Next patient called!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to call next patient');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleMarkAbsent = async () => {
        if (!queue) return;
        const currentCalled = tokens.find(t => t.status === 'called');
        if (!currentCalled) return;

        setLoadingAction('mark-absent');
        try {
            await guestService.markAbsent(queue.id, token, currentCalled.id);
            await fetchData();
            toast.success('Patient marked absent.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to mark patient absent');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDeleteToken = async (tokenId: string) => {
        if (!confirm('Are you sure you want to delete this token?')) return;

        setLoadingAction('delete-token');
        try {
            await guestService.deleteToken(tokenId, token);
            await fetchData();
            toast.success('Token deleted successfully.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete token');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleSendWhatsApp = (tokenData: Token) => {
        const clinic = (queue as any)?.clinics;
        if (!clinic?.slug) return;

        const trackingUrl = `${window.location.origin}/${clinic.slug}?phone=${tokenData.phone}`;
        const name = tokenData.patient_name || 'Patient';
        const message = encodeURIComponent(
            `Hello ${name},\n\nYour token number is *${tokenData.token_number}*.\n` +
            `Track your live status here: ${trackingUrl}\n\n` +
            `- ${clinic.name}`
        );
        const waUrl = `https://wa.me/91${tokenData.phone}?text=${message}`;
        window.open(waUrl, '_blank');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen flex flex-col justify-center">
                <div className="mb-8 space-y-4 text-center md:text-left">
                    <div className="h-8 w-48 bg-slate-200 animate-pulse rounded mx-auto md:mx-0"></div>
                    <div className="h-4 w-64 bg-slate-100 animate-pulse rounded mx-auto md:mx-0"></div>
                </div>
                <QueueDisplaySkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-md text-center min-h-screen flex items-center">
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 w-full shadow-sm">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full gap-2 font-semibold">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!queue) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in mb-20">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Guest Terminal • {(queue as any).clinics?.name}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Queue Manager</h1>
                    <p className="text-slate-500">Live Management for Dr. {queue.doctor_name}</p>
                </div>
                <Button
                    onClick={fetchData}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-500 hover:text-indigo-600 self-end md:self-auto"
                    disabled={!!loadingAction}
                >
                    <RefreshCw className={`w-4 h-4 ${loadingAction ? 'animate-spin' : ''}`} />
                    Refresh Token List
                </Button>
            </div>

            <QueueDisplay
                doctorName={queue.doctor_name}
                doctorImageUrl={queue.doctor_image_url}
                waitingTokens={waitingTokens}
                servedTokens={servedTokens}
                absentTokens={absentTokens}
                onCallNext={handleCallNext}
                onMarkAbsent={handleMarkAbsent}
                onDeleteToken={handleDeleteToken}
                onSendWhatsApp={handleSendWhatsApp}
                isSessionActive={['active', 'paused'].includes(queue.status)}
                loadingAction={loadingAction}
            />

            <footer className="mt-12 text-center text-slate-400 text-xs">
                <p>Secure Guest Session • No Login Required</p>
                <p className="mt-1 font-medium">Mr Compounder — Digital OPD Solution</p>
            </footer>
        </div>
    );
}
