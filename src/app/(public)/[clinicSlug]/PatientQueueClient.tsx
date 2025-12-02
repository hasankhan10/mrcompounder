'use client';

import { useState, useEffect, useRef } from 'react';
import { Clinic, Queue, Token } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { PatientViewSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { PatientLogin } from '@/components/patient/PatientLogin';
import { PatientBookingSelection } from '@/components/patient/PatientBookingSelection';
import { PatientLiveQueue } from '@/components/patient/PatientLiveQueue';

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
  const [bookings, setBookings] = useState<any[]>([]);
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
            // Delay clearing currentToken to allow "Call Next" to arrive and prevent "--" flicker
            setTimeout(() => {
              setCurrentToken((prev) => (prev && prev.id === newToken.id ? null : prev));
            }, 1000);
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

      if (data.bookings && data.bookings.length > 0) {
        // Filter out completed visits (served/no_show)
        const activeBookings = data.bookings.filter((b: any) =>
          b.token.status !== 'served' && b.token.status !== 'no_show'
        );

        if (activeBookings.length > 0) {
          if (activeBookings.length === 1) {
            // Auto-select single active booking
            const b = activeBookings[0];
            setMyToken(b.token);
            setQueue(b.queue);
            setCurrentToken(b.currentToken);
            setLastServedTokenNumber(b.lastServedTokenNumber);
            setLastServedTokens(b.lastServedTokens || []);
          } else {
            // Show selection screen for active bookings
            setBookings(activeBookings);
            setMyToken(null);
          }
        } else {
          // All bookings are completed. Show the most recently served one.
          // Sort by served_at desc (if available) or updated_at
          const lastCompleted = data.bookings.sort((a: any, b: any) =>
            new Date(b.token.updated_at).getTime() - new Date(a.token.updated_at).getTime()
          )[0];

          const b = lastCompleted;
          setMyToken(b.token);
          setQueue(b.queue);
          setCurrentToken(b.currentToken);
          setLastServedTokenNumber(b.lastServedTokenNumber);
          setLastServedTokens(b.lastServedTokens || []);
        }

      } else if (data.token) {
        // Fallback for old API response structure (just in case)
        setMyToken(data.token);
        setQueue(data.queue);
        setCurrentToken(data.currentToken);
        setLastServedTokenNumber(data.lastServedTokenNumber);
        setLastServedTokens(data.lastServedTokens || []);
      }

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
  if (!myToken && bookings.length === 0) {
    return (
      <PatientLogin
        clinic={clinic}
        phone={phone}
        setPhone={setPhone}
        isLoading={isLoading}
        error={error}
        onSubmit={handleCheckBooking}
      />
    );
  }

  // 1.5 Selection View (Multiple Bookings)
  if (!myToken && bookings.length > 0) {
    return (
      <PatientBookingSelection
        bookings={bookings}
        onSelect={(b) => {
          setMyToken(b.token);
          setQueue(b.queue);
          setCurrentToken(b.currentToken);
          setLastServedTokenNumber(b.lastServedTokenNumber);
          setLastServedTokens(b.lastServedTokens || []);
        }}
        onBack={() => {
          setBookings([]);
          setPhone('');
        }}
      />
    );
  }

  // 2. Dashboard View
  return (
    <PatientLiveQueue
      clinic={clinic}
      queue={queue}
      myToken={myToken!}
      currentToken={currentToken}
      bookingsLength={bookings.length}
      onBack={() => {
        setMyToken(null);
        if (bookings.length > 0) {
          // Go back to selection if we have multiple bookings
          // No-op, just clearing myToken will show selection screen
        } else {
          // Go back to search
          setPhone('');
        }
      }}
      getWaitMessage={getWaitMessage}
    />
  );
}
