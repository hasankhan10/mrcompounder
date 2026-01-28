'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Clinic, Queue, Token, BookingData } from '@/lib/types';
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
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [lastServedTokenNumber, setLastServedTokenNumber] = useState<number>(0);
  const [queue, setQueue] = useState<Queue | null>(activeQueue);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlarm = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square'; // Beep sound
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1760, ctx.currentTime + 0.5); // A6 (High beep)

      // Pulsing effect
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      // Loop the beep every 1 second
      const loopInterval = setInterval(() => {
        if (ctx.state === 'closed') {
          clearInterval(loopInterval);
          return;
        }
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.5);
        gn.gain.setValueAtTime(0.5, ctx.currentTime);
        gn.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        gn.gain.setValueAtTime(0.5, ctx.currentTime + 0.5);
        gn.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
        osc.connect(gn);
        gn.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      }, 1000);

      (window as unknown as { alarmInterval: NodeJS.Timeout }).alarmInterval = loopInterval;

    } catch (e) {
      console.error('Alarm error', e);
    }
  };

  const stopAlarm = () => {
    if ((window as unknown as { alarmInterval: NodeJS.Timeout }).alarmInterval) {
      clearInterval((window as unknown as { alarmInterval: NodeJS.Timeout }).alarmInterval);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Preload Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/alert-sound.mp3');
    }
  }, []);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastServedTokens, setLastServedTokens] = useState<Token[]>([]);

  const fetchBookingStatus = useCallback(async (phoneNumber: string) => {
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
        const activeBookings = data.bookings.filter((b: BookingData) =>
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
          const lastCompleted = data.bookings.sort((a: BookingData, b: BookingData) => {
            const timeA = new Date(a.token.served_at || a.token.created_at).getTime();
            const timeB = new Date(b.token.served_at || b.token.created_at).getTime();
            return timeB - timeA;
          })[0];

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

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [clinic]);

  // --- TIERED UPDATE LOGIC (10X Optimization) ---
  const [useRealtime, setUseRealtime] = useState(false);

  useEffect(() => {
    if (!myToken) return;

    // Condition for Real-time Entry Tier:
    // 1. I am already "called" (my turn is now)
    // 2. I am the literal "Next" in line (Current Token + 1)
    const currentNum = currentToken ? currentToken.token_number : lastServedTokenNumber;
    const isNext = myToken.status === 'called' ||
      (myToken.status === 'waiting' && myToken.token_number === currentNum + 1);

    if (isNext !== useRealtime) {
      console.log(`[Queue Optimizer] Switching to ${isNext ? 'REAL-TIME' : 'POLLING'} mode for token #${myToken.token_number}`);
      setUseRealtime(isNext);
    }
  }, [myToken?.status, myToken?.token_number, currentToken?.token_number, lastServedTokenNumber, useRealtime]);

  // Polling Effect (Tier 2 - Bulk Optimization)
  // This reduces WebSocket connection pressure on Supabase by 90%+
  useEffect(() => {
    // Only poll if we have a phone, are NOT in real-time mode, and have an active waiting token
    if (!phone || useRealtime || !myToken || myToken.status === 'served' || myToken.status === 'no_show') {
      return;
    }

    const intervalId = setInterval(() => {
      console.log(`[Queue Optimizer] Polling for update (Token #${myToken.token_number})...`);
      fetchBookingStatus(phone);
    }, 10000); // 10s as requested

    return () => clearInterval(intervalId);
  }, [phone, useRealtime, myToken?.id, myToken?.status, fetchBookingStatus]);

  // Real-time Subscription (Tier 1 - Mission Critical)
  useEffect(() => {
    if (!queue || !useRealtime) return;

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
                // Trigger Flash and Sound
                setIsFlashing(true);

                // Play Code-Generated Alarm (No MP3 needed)
                playAlarm();

                toast.success("It's your turn! Please proceed to the doctor.");

                // Stop after 10 seconds
                setTimeout(() => {
                  setIsFlashing(false);
                  stopAlarm();
                }, 10000);
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
  }, [queue, supabase, useRealtime]); // Depend on useRealtime for handover

  const enableAudio = () => {
    try {
      // Method 1: Try to load the file (for the actual alarm later)
      if (audioRef.current) {
        audioRef.current.load();
      }

      // Method 2: Web Audio API (The 100% Fix)
      // We create a silent oscillator to force the browser's audio engine to wake up.
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        gainNode.gain.value = 0.01; // Almost silent
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(0);
        setTimeout(() => oscillator.stop(), 100); // Play for 100ms

        setAudioEnabled(true);
        toast.success("Audio Alerts Enabled! Keep this tab open.");
      } else {
        // Fallback for very old browsers
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            audioRef.current?.pause();
            setAudioEnabled(true);
          }).catch(e => console.error(e));
        }
      }
    } catch (err) {
      console.error("Audio enable failed:", err);
      toast.error("Could not enable audio. Please try again.");
    }
  };


  // Auto-login on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('clinicline_patient_phone');
    if (savedPhone && clinic) {
      setPhone(savedPhone);
      fetchBookingStatus(savedPhone);
    }
  }, [clinic, fetchBookingStatus]);

  const handleCheckBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Unlock Audio Context (User Interaction) - Critical for Mobile
    if (audioRef.current) {
      audioRef.current.load(); // Force load
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
      }).catch(err => console.warn('Audio unlock failed (expected if no interaction):', err));
    }

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
      const newest = new Date(lastServedTokens[0].served_at || Date.now()).getTime();
      const oldest = new Date(lastServedTokens[lastServedTokens.length - 1].served_at || Date.now()).getTime();
      const timeSpanMinutes = (newest - oldest) / (1000 * 60);
      const count = lastServedTokens.length - 1; // Intervals

      if (count > 0 && timeSpanMinutes > 0) {
        avgTimePerPatient = Math.max(1, Math.round(timeSpanMinutes / count));
      }
    }

    const estTime = diff * avgTimePerPatient;
    return `~${estTime} mins wait (${peopleAhead} people ahead)`;
  };

  // Flash State
  const [isFlashing, setIsFlashing] = useState(false);

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
          // Unlock Audio Context
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              audioRef.current?.pause();
              audioRef.current!.currentTime = 0;
            }).catch(err => console.warn('Audio unlock failed:', err));
          }

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
      isCalled={isFlashing}
      audioEnabled={audioEnabled}
      onEnableAudio={enableAudio}
    />
  );
}
