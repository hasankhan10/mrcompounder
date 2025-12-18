import { Clinic, Queue, Token } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientLiveQueueProps {
    clinic: Clinic;
    queue: Queue | null;
    myToken: Token;
    currentToken: Token | null;
    bookingsLength: number;
    onBack: () => void;
    getWaitMessage: () => string;
    isCalled: boolean;
    audioEnabled: boolean;
    onEnableAudio: () => void;
}

export function PatientLiveQueue({
    clinic,
    queue,
    myToken,
    currentToken,
    bookingsLength,
    onBack,
    getWaitMessage,
    isCalled,
    audioEnabled,
    onEnableAudio
}: PatientLiveQueueProps) {
    return (
        <main className={`min-h-screen flex flex-col items-center p-4 md:pt-10 transition-colors duration-500 ${isCalled ? 'bg-green-500 animate-pulse' : 'bg-slate-50'
            }`}>
            <div className="w-full max-w-md space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-4">
                    {queue?.doctor_image_url ? (
                        <div className="relative w-32 h-32">
                            <Image
                                src={queue.doctor_image_url}
                                alt="Doctor"
                                fill
                                className="rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-4xl border-4 border-white shadow-lg">
                            {queue?.doctor_name?.charAt(0) || 'D'}
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-slate-900 text-2xl md:text-3xl leading-tight mb-1">Dr. {queue?.doctor_name || 'Doctor'}</h1>
                        <p className="text-base text-slate-500 font-medium">{clinic.name}</p>
                    </div>
                </div>

                {myToken.status === 'served' ? (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center border-t-4 border-green-500 animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Visit Completed</h2>
                        <p className="text-slate-600 text-lg mb-6">Thank you for visiting <strong>{clinic.name}</strong>.</p>
                        <p className="text-sm text-slate-400">We hope you have a speedy recovery!</p>

                        <Button
                            variant="outline"
                            className="mt-8 w-full"
                            onClick={onBack}
                        >
                            Back to Home
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Live Status Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className={`p-4 text-center ${queue?.status === 'paused' ? 'bg-orange-500' : 'bg-teal-600'}`}>
                                <p className="text-white font-medium uppercase tracking-wide text-sm">
                                    {queue?.status === 'paused' ? 'Session Paused' : 'Now Serving Token'}
                                </p>
                            </div>
                            <div className="p-10 text-center">
                                {queue?.status === 'waiting' ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <p className="text-6xl mb-4">👨‍⚕️</p>
                                        <p className="text-xl font-bold text-slate-700">Doctor has not arrived yet</p>
                                        {queue.doctor_arrival_time && (
                                            <p className="text-lg font-semibold text-teal-600 mt-1">
                                                Arriving at: {queue.doctor_arrival_time}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-500 mt-2">Please wait for the session to start.</p>
                                    </div>
                                ) : queue?.status === 'paused' ? (
                                    <div className="flex flex-col items-center justify-center h-full animate-pulse">
                                        <p className="text-6xl mb-4">☕</p>
                                        <p className="text-xl font-bold text-orange-700">Doctor is on a Break</p>
                                        <p className="text-sm text-slate-500 mt-2">We will resume shortly.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-8xl font-black text-slate-900 tracking-tighter overflow-hidden h-48 flex items-center justify-center relative">
                                            <AnimatePresence mode="popLayout">
                                                <motion.div
                                                    key={currentToken ? currentToken.token_number : 'none'}
                                                    initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
                                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                                    exit={{ y: -50, opacity: 0, filter: 'blur(10px)' }}
                                                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                                    className="absolute flex flex-col items-center w-full"
                                                >
                                                    <span>{currentToken ? currentToken.token_number : '--'}</span>
                                                    {currentToken && (currentToken.is_emergency || currentToken.purpose) && (
                                                        <span className={`text-lg px-4 py-1.5 rounded-full font-bold uppercase tracking-wider mt-2 shadow-sm border ${currentToken.is_emergency ? 'bg-red-50 text-red-600 border-red-100' :
                                                            currentToken.purpose?.toLowerCase().includes('report') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-teal-50 text-teal-600 border-teal-100'
                                                            }`}>
                                                            {currentToken.is_emergency ? 'Emergency' : currentToken.purpose}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                        <p className="text-slate-400 mt-2 text-sm">
                                            {currentToken ? 'Currently in consultation' : 'Waiting for next patient...'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Audio Toggle */}
                        {!audioEnabled && myToken.status === 'waiting' && (
                            <Button
                                onClick={onEnableAudio}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg animate-pulse"
                            >
                                🔔 Enable Audio Alerts
                            </Button>
                        )}
                        {audioEnabled && myToken.status === 'waiting' && (
                            <div className="text-center text-green-600 font-medium text-sm bg-green-50 py-2 rounded-lg">
                                🔊 Audio Alerts Enabled
                            </div>
                        )}

                        {/* My Token Card */}
                        <div className={`rounded-2xl shadow-md p-6 border-2 ${myToken.status === 'called' ? 'bg-green-50 border-green-500' : 'bg-white border-transparent'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 font-medium">Your Token</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${myToken.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                    myToken.status === 'called' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {myToken.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-slate-900">#{myToken.token_number}</span>
                            </div>

                            {myToken.status === 'waiting' && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-slate-600 font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                                        {getWaitMessage()}
                                    </p>
                                </div>
                            )}

                            {myToken.status === 'called' && (
                                <div className="mt-4">
                                    <p className="text-green-700 font-bold text-lg animate-bounce">
                                        It&apos;s your turn! Please go inside.
                                    </p>
                                </div>
                            )}
                        </div>

                    </>
                )}

                {myToken.status !== 'served' && (
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-slate-600"
                        onClick={onBack}
                    >
                        {bookingsLength > 0 ? 'Back to My Bookings' : 'Check another number'}
                    </Button>
                )}

            </div>
        </main >
    );
}
