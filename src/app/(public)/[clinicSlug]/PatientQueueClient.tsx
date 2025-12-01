'use client';

import { useState, useEffect, useRef } from 'react';
import { Clinic, Queue, Token } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { PatientViewSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { motion, AnimatePresence } from 'framer-motion';

interface InitialData {
  clinic: Clinic | null;
  activeQueue: Queue | null;
}

interface PatientQueueClientProps {
  initialData: InitialData;
}

export function PatientQueueClient({ initialData }: PatientQueueClientProps) {
  const [supabase] = useState(() => createClient());
  const { clinic, activeQueue } = initialData;

  // State
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard State
  const [myToken, setMyToken] = useState<Token | null>(null);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [lastServedTokenNumber, setLastServedTokenNumber] = useState<number>(0);
  const [queue, setQueue] = useState<Queue | null>(activeQueue);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/alert-sound.mp3');
    }
  }, []);

  // Real-time Subscription
  useEffect(() => {
    if (!queue) return;

    const channel = supabase
      .channel(`patient-view-${queue.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tokens', filter: `queue_id=eq.${queue.id}` },
        (payload) => {
          const newToken = payload.new as Token;
          console.log('Realtime Event:', payload.eventType, newToken);

          // Update My Token
          setMyToken((prev) => {
            if (prev && prev.id === newToken.id) {
              if (newToken.status === 'called' && prev.status !== 'called') {
                audioRef.current?.play().catch(e => console.log('Audio error', e));
                toast.success("It's your turn! Please proceed to the doctor.");
              }
              return newToken;
            }
            return prev;
          });

          // Update Current/Last Served
          if (newToken.status === 'called') {
            setCurrentToken(newToken);
            // Self-healing: If we get a called token, the session MUST be active.
            setQueue(prev => {
              if (prev && prev.status === 'waiting') {
                return { ...prev, status: 'active' };
              }
              return prev;
            });
          } else if (newToken.status === 'served') {
            setLastServedTokenNumber(newToken.token_number);
            setCurrentToken((prev) => (prev && prev.id === newToken.id ? null : prev));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queue.id}` },
        (payload) => {
          setQueue(payload.new as Queue);
          toast.info('Session status updated.');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queue?.id, supabase]); // Only re-subscribe if queue ID changes


  const [lastServedTokens, setLastServedTokens] = useState<any[]>([]);

  const fetchBookingStatus = async (phoneNumber: string) => {
    if (!clinic) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/patient/check-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId: clinic.id, phone: phoneNumber }),
      });

      if (!response.ok) {
        const err = await response.json();
        // If 404 (not found), clear storage so they can enter a new number
        if (response.status === 404) {
          localStorage.removeItem('clinicline_patient_phone');
        }
        throw new Error(err.error || 'Failed to check booking.');
      }

      const data = await response.json();
      setMyToken(data.token);
      setQueue(data.queue);
      setCurrentToken(data.currentToken);
      setLastServedTokenNumber(data.lastServedTokenNumber);
      setLastServedTokens(data.lastServedTokens || []);

      // Persist Phone
      localStorage.setItem('clinicline_patient_phone', phoneNumber);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-login on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('clinicline_patient_phone');
    if (savedPhone && clinic) {
      setPhone(savedPhone);
      fetchBookingStatus(savedPhone);
    }
  }, [clinic]);

  const handleCheckBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    await fetchBookingStatus(phone);
  };

  // Helper for Wait Time
  const getWaitMessage = () => {
    if (!myToken) return '';
    if (myToken.status === 'served') return 'You have been served. Thank you!';
    if (myToken.status === 'called') return "It's your turn! Go inside.";
    if (myToken.status === 'no_show') return "You were marked as No Show.";

    const currentNum = currentToken ? currentToken.token_number : lastServedTokenNumber;
    const diff = myToken.token_number - currentNum;

    if (diff <= 0) return "You should be called soon.";

    const peopleAhead = diff - 1;
    if (peopleAhead < 0) return "You are next!";

    // Sliding Window Algorithm for Average Wait Time
    let avgTimePerPatient = 5; // Default fallback
    if (lastServedTokens.length >= 2) {
      // lastServedTokens is sorted DESC (newest first)
      const newest = new Date(lastServedTokens[0].served_at).getTime();
      const oldest = new Date(lastServedTokens[lastServedTokens.length - 1].served_at).getTime();
      const timeSpanMinutes = (newest - oldest) / (1000 * 60);
      const count = lastServedTokens.length - 1; // Intervals

      if (count > 0 && timeSpanMinutes > 0) {
        avgTimePerPatient = Math.max(1, Math.round(timeSpanMinutes / count));
      }
    }

    const estTime = diff * avgTimePerPatient;
    return `~${estTime} mins wait (${peopleAhead} people ahead)`;
  };

  // --- Render ---

  if (!clinic) return <div className="p-10 text-center">Clinic not found</div>;

  if (isLoading && !myToken) {
    return <PatientViewSkeleton />;
  }

  // 1. Login View
  if (!myToken) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            {clinic.logo_url ? (
              <img src={clinic.logo_url} alt="Logo" className="w-20 h-20 mx-auto rounded-xl mb-4 shadow-sm" />
            ) : (
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl mb-4">
                {clinic.name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
            <p className="text-gray-500">Check your queue status</p>
          </div>

          <form onSubmit={handleCheckBooking} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-center text-2xl py-6 tracking-widest"
                placeholder="9999999999"
                maxLength={10}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Check Status'}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // 2. Dashboard View
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:pt-10">
      <div className="w-full max-w-md space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          {clinic.logo_url ? (
            <img src={clinic.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
              {clinic.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{clinic.name}</h1>
            <p className="text-sm text-gray-500">Dr. {queue?.doctor_name || 'Doctor'}</p>
          </div>
        </div>

        {/* Break Banner Removed */}

        {myToken.status === 'served' ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center border-t-4 border-green-500 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Visit Completed</h2>
            <p className="text-gray-600 text-lg mb-6">Thank you for visiting <strong>{clinic.name}</strong>.</p>
            <p className="text-sm text-gray-400">We hope you have a speedy recovery!</p>

            <Button
              variant="outline"
              className="mt-8 w-full"
              onClick={() => setMyToken(null)}
            >
              Back to Home
            </Button>
          </div>
        ) : (
          <>
            {/* Live Status Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`p-4 text-center ${queue?.status === 'paused' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                <p className="text-white font-medium uppercase tracking-wide text-sm">
                  {queue?.status === 'paused' ? 'Session Paused' : 'Now Serving Token'}
                </p>
              </div>
              <div className="p-10 text-center">
                {queue?.status === 'waiting' ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-6xl mb-4">👨‍⚕️</p>
                    <p className="text-xl font-bold text-gray-700">Doctor has not arrived yet</p>
                    {queue.doctor_arrival_time && (
                      <p className="text-lg font-semibold text-blue-600 mt-1">
                        Arriving at: {queue.doctor_arrival_time}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Please wait for the session to start.</p>
                  </div>
                ) : queue?.status === 'paused' ? (
                  <div className="flex flex-col items-center justify-center h-full animate-pulse">
                    <p className="text-6xl mb-4">☕</p>
                    <p className="text-xl font-bold text-orange-700">Doctor is on a Break</p>
                    <p className="text-sm text-gray-500 mt-2">We will resume shortly.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-8xl font-black text-gray-900 tracking-tighter overflow-hidden h-32 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentToken ? currentToken.token_number : 'none'}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -50, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {currentToken ? currentToken.token_number : '--'}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">
                      {currentToken ? 'Currently in consultation' : 'Waiting for next patient...'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* My Token Card */}
            <div className={`rounded-2xl shadow-md p-6 border-2 ${myToken.status === 'called' ? 'bg-green-50 border-green-500' : 'bg-white border-transparent'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Your Token</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${myToken.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                  myToken.status === 'called' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {myToken.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">#{myToken.token_number}</span>
              </div>

              {myToken.status === 'waiting' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    {getWaitMessage()}
                  </p>
                </div>
              )}

              {myToken.status === 'called' && (
                <div className="mt-4">
                  <p className="text-green-700 font-bold text-lg animate-bounce">
                    It's your turn! Please go inside.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {myToken.status !== 'served' && (
          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-600"
            onClick={() => setMyToken(null)}
          >
            Check another number
          </Button>
        )}

      </div>
    </main>
  );
}
