import { FormEvent } from 'react';
import { Queue, Token } from '@/lib/types';
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
    onEndSession: () => void;
    onRegisterPatient: (e: FormEvent) => void;
    onCallNext: () => void;
    onDeleteToken: (id: string) => void;

    // Form State
    newDoctorName: string;
    setNewDoctorName: (val: string) => void;
    newDoctorImage: File | null;
    setNewDoctorImage: (file: File | null) => void;
    setSelectedExistingImage: (url: string | null) => void;
    newDoctorArrivalTime: string;
    setNewDoctorArrivalTime: (val: string) => void;
    recentDoctors: any[];

    newPatientName: string;
    setNewPatientName: (val: string) => void;
    newPatientPhone: string;
    setNewPatientPhone: (val: string) => void;
    newPatientPurpose: string;
    setNewPatientPurpose: (val: string) => void;
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
    onEndSession,
    onRegisterPatient,
    onCallNext,
    onDeleteToken,
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
    newPatientPurpose,
    setNewPatientPurpose
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
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Select Session to Book</h2>
                    {activeQueues.length === 0 ? (
                        <p className="text-gray-500 italic">No active sessions. Start one on the right.</p>
                    ) : (
                        <SessionGrid queues={activeQueues} tokens={tokens} onSelect={setSelectedQueueId} />
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Start New Session</h2>
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
                        isLoading={formIsLoading}
                        onSubmit={onStartSession}
                        recentDoctors={recentDoctors}
                        onSelectRecent={(doc) => {
                            setNewDoctorName(doc.name);
                            setSelectedExistingImage(doc.imageUrl);
                            setNewDoctorImage(null);
                            toast.info(`Selected ${doc.name}`);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <Button variant="outline" onClick={() => setSelectedQueueId(null)} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                    <ArrowLeft className="w-4 h-4" /> Back to Selection
                </Button>
            </div>

            {activeQueue!.status === 'waiting' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-8 animate-pulse">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Doctor is Arriving?</h3>
                    <p className="text-blue-700 mb-6">Booking is open. Click below when the doctor is ready to see patients.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={onActivateSession}
                            disabled={formIsLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-6 shadow-lg transform transition cursor-pointer hover:scale-105"
                        >
                            {formIsLoading ? 'Starting...' : 'Start Session'}
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            onClick={onEndSession}
                            disabled={formIsLoading}
                            className="bg-white hover:bg-red-50 text-red-600 border-red-200 font-bold text-lg px-8 py-6 shadow-sm transform transition cursor-pointer hover:scale-105"
                        >
                            Cancel Session
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
                patientPurpose={newPatientPurpose}
                setPatientPurpose={setNewPatientPurpose}
                isLoading={formIsLoading}
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
                    isSessionActive={activeQueue!.status === 'active'}
                    onDeleteToken={onDeleteToken}
                    showControls={false}
                />
            </div>
        </>
    );
}
