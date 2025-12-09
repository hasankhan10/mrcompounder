import { FormEvent } from 'react';
import { Queue, Token, RecentDoctor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SessionGrid } from '@/components/dashboard/SessionGrid';
import { StartSessionCard } from '@/components/dashboard/StartSessionCard';
import { RegisterPatientCard } from '@/components/dashboard/RegisterPatientCard';
import { QueueDisplay } from '@/components/dashboard/QueueDisplay';

interface BookingTabProps {
    isLoading: boolean;
    activeQueues: Queue[];
    tokens: Token[];
    selectedQueueId: string | null;
    setSelectedQueueId: (id: string | null) => void;
    activeQueue: Queue | null;
    waitingTokens: Token[];
    servedTokens: Token[];
    formIsLoading: boolean;
    onStartSession: (e: FormEvent) => void;
    onActivateSession: () => void;

    onCancelSession: () => void;
    onRegisterPatient: (e: FormEvent) => void;
    onCallNext: () => void;
    onDeleteToken: (id: string) => void;
    onMarkAbsent: () => void;

    // Form State
    newDoctorName: string;
    setNewDoctorName: (val: string) => void;
    newDoctorImage: File | null;
    setNewDoctorImage: (file: File | null) => void;
    setSelectedExistingImage: (url: string | null) => void;
    newDoctorArrivalTime: string;
    setNewDoctorArrivalTime: (val: string) => void;
    recentDoctors: RecentDoctor[];

    newPatientName: string;
    setNewPatientName: (val: string) => void;
    newPatientPhone: string;
    setNewPatientPhone: (val: string) => void;
    newPatientGender?: 'male' | 'female' | 'other';
    setNewPatientGender: (val: 'male' | 'female' | 'other' | undefined) => void;
    newPatientAge: string;
    setNewPatientAge: (val: string) => void;
    newPatientPurpose: string;
    setNewPatientPurpose: (val: string) => void;
    loadingAction: string | null;
}

export function BookingTab({
    isLoading,
    activeQueues,
    tokens,
    selectedQueueId,
    setSelectedQueueId,
    activeQueue,
    waitingTokens,
    servedTokens,
    formIsLoading,
    onStartSession,
    onActivateSession,

    onCancelSession,
    onRegisterPatient,
    onCallNext,
    onDeleteToken,
    onMarkAbsent,
    newDoctorName,
    setNewDoctorName,
    newDoctorImage,
    setNewDoctorImage,
    setSelectedExistingImage,
    newDoctorArrivalTime,
    setNewDoctorArrivalTime,
    recentDoctors,
    newPatientName,
    setNewPatientName,
    newPatientPhone,
    setNewPatientPhone,
    newPatientGender,
    setNewPatientGender,
    newPatientAge,
    setNewPatientAge,
    newPatientPurpose,
    setNewPatientPurpose,
    loadingAction
}: BookingTabProps) {

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    if (!selectedQueueId) {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Select Session to Book</h2>
                    {activeQueues.filter(q => q.status !== 'cancelled').length === 0 ? (
                        <p className="text-slate-500 italic">No active sessions. Start one on the right.</p>
                    ) : (
                        <SessionGrid queues={activeQueues.filter(q => q.status !== 'cancelled')} tokens={tokens} onSelect={setSelectedQueueId} />
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Start New Session</h2>
                    <StartSessionCard
                        doctorName={newDoctorName}
                        setDoctorName={setNewDoctorName}
                        doctorImage={newDoctorImage}
                        setDoctorImage={(file) => {
                            setNewDoctorImage(file);
                            if (file) setSelectedExistingImage(null);
                        }}
                        doctorArrivalTime={newDoctorArrivalTime}
                        setDoctorArrivalTime={setNewDoctorArrivalTime}
                        isLoading={formIsLoading || loadingAction === 'start-session'}
                        onSubmit={onStartSession}
                        recentDoctors={recentDoctors}
                        onSelectRecent={(doc) => {
                            setNewDoctorName(doc.doctor_name);
                            setSelectedExistingImage(doc.doctor_image_url);
                            setNewDoctorImage(null);
                            toast.info(`Selected ${doc.doctor_name}`);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <Button variant="outline" onClick={() => setSelectedQueueId(null)} className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Back to Selection
                </Button>
            </div>

            {activeQueue!.status === 'waiting' && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center mb-8 animate-pulse">
                    <h3 className="text-xl font-bold text-teal-900 mb-2">Doctor is Arriving?</h3>
                    <p className="text-teal-700 mb-6">Booking is open. Click below when the doctor is ready to see patients.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={onActivateSession}
                            disabled={formIsLoading || !!loadingAction}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg px-12 py-6 shadow-lg transform transition cursor-pointer hover:scale-105"
                        >
                            {loadingAction === 'activate-session' ? 'Starting...' : 'Start Session'}
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            onClick={onCancelSession}
                            disabled={formIsLoading || !!loadingAction}
                            className="bg-white border-red-200 font-bold text-lg px-8 py-6 shadow-sm transform transition cursor-pointer hover:scale-105"
                        >
                            {loadingAction === 'cancel-session' ? 'Cancelling...' : 'Cancel Session'}
                        </Button>
                    </div>
                </div>
            )}

            <RegisterPatientCard
                doctorName={activeQueue!.doctor_name}
                doctorImageUrl={activeQueue!.doctor_image_url}
                patientName={newPatientName}
                setPatientName={setNewPatientName}
                patientPhone={newPatientPhone}
                setPatientPhone={setNewPatientPhone}
                patientGender={newPatientGender}
                setPatientGender={setNewPatientGender}
                patientAge={newPatientAge}
                setPatientAge={setNewPatientAge}
                patientPurpose={newPatientPurpose}
                setPatientPurpose={setNewPatientPurpose}
                isLoading={formIsLoading || loadingAction === 'register-patient'}
                isSessionActive={['active', 'waiting'].includes(activeQueue!.status)}
                onSubmit={onRegisterPatient}
            />

            <div className="mt-8">
                <QueueDisplay
                    doctorName={activeQueue!.doctor_name}
                    doctorImageUrl={activeQueue!.doctor_image_url}
                    waitingTokens={waitingTokens}
                    servedTokens={servedTokens}
                    onCallNext={onCallNext}
                    onMarkAbsent={onMarkAbsent}
                    isSessionActive={activeQueue!.status === 'active'}
                    onDeleteToken={onDeleteToken}
                    showControls={false}
                    loadingAction={loadingAction}
                />
            </div>
        </>
    );
}
