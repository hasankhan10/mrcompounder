import { Queue, Token } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { SessionGrid } from '@/components/dashboard/SessionGrid';
import { SessionStatusCard } from '@/components/dashboard/SessionStatusCard';
import { QueueDisplay } from '@/components/dashboard/QueueDisplay';
import { QueueDisplaySkeleton } from '@/components/skeletons/DashboardSkeletons';

interface OverviewTabProps {
    isLoading: boolean;
    activeQueues: Queue[];
    tokens: Token[];
    selectedQueueId: string | null;
    setSelectedQueueId: (id: string | null) => void;
    setActiveTab: (tab: string) => void;
    activeQueue: Queue | null;
    waitingTokens: Token[];
    servedTokens: Token[];
    onToggleBreak: () => void;
    onEndSession: () => void;
    onCallNext: () => void;
    onDeleteToken: (id: string) => void;
}

export function OverviewTab({
    isLoading,
    activeQueues,
    tokens,
    selectedQueueId,
    setSelectedQueueId,
    setActiveTab,
    activeQueue,
    waitingTokens,
    servedTokens,
    onToggleBreak,
    onEndSession,
    onCallNext,
    onDeleteToken
}: OverviewTabProps) {

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-8">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <QueueDisplaySkeleton />
                <div className="space-y-8">
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!selectedQueueId) {
        const liveSessions = activeQueues.filter(q => q.status !== 'waiting');
        return (
            <div>
                {liveSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <LayoutDashboard className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No Live Sessions</h3>
                        <p className="text-gray-500 mt-2 mb-6">Sessions waiting for doctors are in Patient Booking.</p>
                        <Button onClick={() => setActiveTab('patient-booking')} className="bg-blue-600 hover:bg-blue-700">
                            Go to Patient Booking
                        </Button>
                    </div>
                ) : (
                    <SessionGrid queues={liveSessions} tokens={tokens} onSelect={setSelectedQueueId} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Button variant="outline" onClick={() => setSelectedQueueId(null)} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" /> Back to All Sessions
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="space-y-8">
                    <SessionStatusCard
                        status={activeQueue!.status as 'active' | 'paused'}
                        doctorName={activeQueue!.doctor_name || 'Unknown Doctor'}
                        onToggleBreak={onToggleBreak}
                        onEndSession={onEndSession}
                    />
                </div>

                {/* Middle Column: Current Token Display */}
                <QueueDisplay
                    doctorName={activeQueue!.doctor_name}
                    doctorImageUrl={activeQueue!.doctor_image_url}
                    waitingTokens={waitingTokens}
                    servedTokens={servedTokens}
                    onCallNext={onCallNext}
                    isSessionActive={activeQueue!.status === 'active'}
                    onDeleteToken={onDeleteToken}
                />
            </div>
        </div>
    );
}
