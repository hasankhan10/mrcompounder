'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic, Queue, Token } from '@/lib/types';
import { toast } from 'sonner';
import { RechargeModal } from '@/components/dashboard/RechargeModal';
import { PieChart, Settings, Users, LayoutDashboard, History, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';
import { PageLoading } from '@/components/shared/PageLoading';
import { PageError } from '@/components/shared/PageError';
import { StartSessionCard } from '@/components/dashboard/StartSessionCard';
import { RegisterPatientCard } from '@/components/dashboard/RegisterPatientCard';
import { SessionStatusCard } from '@/components/dashboard/SessionStatusCard';
import { QueueDisplay } from '@/components/dashboard/QueueDisplay';

interface DashboardClientProps {
  initialClinic: Clinic | null;
  initialQueue: Queue | null;
  initialWaitingTokens: Token[];
  initialServedTokens: Token[];
  serverTime: string;
}

// Helper to check if trial is currently active
const isTrialActive = (c: Clinic | null, nowDate?: Date) => {
  if (!c?.trial_start_date || !c?.trial_end_date) return false;
  const now = nowDate || new Date();
  const start = new Date(c.trial_start_date);
  const end = new Date(c.trial_end_date);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
};

export function DashboardClient({
  initialClinic,
  initialQueue,
  initialWaitingTokens,
  initialServedTokens,
  serverTime
}: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Page-level state
  const [pageIsLoading, setPageIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  // Data state
  const [clinic, setClinic] = useState<Clinic | null>(initialClinic);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(initialQueue);
  const [waitingTokens, setWaitingTokens] = useState<Token[]>(initialWaitingTokens);
  const [servedTokens, setServedTokens] = useState<Token[]>(initialServedTokens);
  const [pastSessions, setPastSessions] = useState<Queue[]>([]);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(
    (initialClinic?.prepaid_balance || 0) < 50 && !isTrialActive(initialClinic, new Date(serverTime))
  );

  // Form state
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorImage, setNewDoctorImage] = useState<File | null>(null);
  const [selectedExistingImage, setSelectedExistingImage] = useState<string | null>(null);
  const [recentDoctors, setRecentDoctors] = useState<any[]>([]);
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/dashboard/history');
      if (res.ok) {
        const data = await res.json();
        setPastSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  // Fetch recent doctors
  useEffect(() => {
    const fetchRecentDoctors = async () => {
      try {
        const res = await fetch('/api/dashboard/doctors/recent');
        if (res.ok) {
          const data = await res.json();
          setRecentDoctors(data);
        }
      } catch (error) {
        console.error('Failed to fetch recent doctors', error);
      }
    };
    fetchRecentDoctors();
  }, []);

  useEffect(() => {
    if (!activeQueue) {
      fetchHistory();
    }
  }, [activeQueue]);

  // Real-time subscription for clinic updates
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
            await handleLogout();
            return;
          }

          // Update local state
          setClinic(updatedClinic);
          // Update low balance warning if needed (assuming threshold is 50 or similar)
          setLowBalanceWarning(
            updatedClinic.prepaid_balance < 50 && !isTrialActive(updatedClinic)
          );
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
            // If we don't have an active queue, and this one is active/waiting/paused
            if (!activeQueue && newQueue.status !== 'ended') {
              setActiveQueue(newQueue);
            }
            // If inserted as ended, add to history
            if (newQueue.status === 'ended') {
              setPastSessions(prev => [newQueue, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedQueue = payload.new as Queue;

            // 1. Handle Active Queue
            if (activeQueue && activeQueue.id === updatedQueue.id) {
              if (updatedQueue.status === 'ended') {
                // Session ended remotely
                setActiveQueue(null);
                setWaitingTokens([]);
                setServedTokens([]);
                toast.info('Session ended.');
              } else {
                setActiveQueue(updatedQueue);
              }
            }

            // 2. Handle History
            if (updatedQueue.status === 'ended') {
              setPastSessions(prev => {
                const exists = prev.find(q => q.id === updatedQueue.id);
                if (exists) {
                  return prev.map(q => q.id === updatedQueue.id ? updatedQueue : q);
                }
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
  }, [clinic?.id, supabase, router, activeQueue]);

  // Real-time tokens subscription
  useEffect(() => {
    if (!activeQueue) return;

    const channel = supabase
      .channel(`tokens-${activeQueue.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
          filter: `queue_id=eq.${activeQueue.id}`,
        },
        (payload) => {
          const eventType = payload.eventType;

          if (eventType === 'INSERT') {
            const newToken = payload.new as Token;
            setWaitingTokens((prev) => {
              if (prev.find(t => t.id === newToken.id)) return prev;
              return [...prev, newToken];
            });
          } else if (eventType === 'UPDATE') {
            const updatedToken = payload.new as Token;

            // Handle waiting tokens
            setWaitingTokens((prev) => {
              const exists = prev.find(t => t.id === updatedToken.id);
              if (exists) {
                if (updatedToken.status === 'served' || updatedToken.status === 'no_show') {
                  return prev.filter(t => t.id !== updatedToken.id);
                }
                return prev.map(t => t.id === updatedToken.id ? updatedToken : t);
              }
              // If it wasn't in waiting but now is (unlikely but possible), add it
              if (updatedToken.status === 'waiting' || updatedToken.status === 'called') {
                return [...prev, updatedToken];
              }
              return prev;
            });

            // Handle served tokens
            setServedTokens((prev) => {
              const exists = prev.find(t => t.id === updatedToken.id);
              if (exists) {
                return prev.map(t => t.id === updatedToken.id ? updatedToken : t);
              }
              if (updatedToken.status === 'served' || updatedToken.status === 'no_show') {
                return [updatedToken, ...prev];
              }
              return prev;
            });
          } else if (eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setWaitingTokens((prev) => prev.filter(t => t.id !== deletedId));
            setServedTokens((prev) => prev.filter(t => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeQueue?.id, supabase]);

  // Handlers
  const handleStartSession = async (e: FormEvent) => {
    e.preventDefault();
    setFormIsLoading(true);

    // Feedback for image upload
    if (newDoctorImage) {
      toast.info('Uploading doctor image...');
    }

    try {
      let doctorImageUrl = selectedExistingImage || ''; // Use existing if selected

      // If new file is uploaded, it overrides existing selection
      if (newDoctorImage) {
        const fileExt = newDoctorImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('doctor-images')
          .upload(fileName, newDoctorImage);

        if (uploadError) throw new Error('Doctor image upload failed: ' + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from('doctor-images')
          .getPublicUrl(fileName);

        doctorImageUrl = publicUrl;
      }

      const response = await fetch('/api/dashboard/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorName: newDoctorName, doctorImageUrl }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to start session');
      }

      const newQueue = await response.json();
      setActiveQueue(newQueue);
      setNewDoctorName('');
      setNewDoctorImage(null);
      setSelectedExistingImage(null);
      toast.success('Session started successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    if (!activeQueue) return;
    const newStatus = activeQueue.status === 'active' ? 'paused' : 'active';

    try {
      const response = await fetch('/api/dashboard/session/toggle-break', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeQueue.id, newStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle break');

      const updatedQueue = await response.json();
      setActiveQueue(updatedQueue);
      toast.success(newStatus === 'paused' ? 'Session paused' : 'Session resumed');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEndSession = async () => {
    if (!activeQueue) return;
    if (!confirm('Are you sure you want to end the session? This will clear the current queue.')) return;

    try {
      const response = await fetch('/api/dashboard/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeQueue.id }),
      });

      if (!response.ok) throw new Error('Failed to end session');

      setActiveQueue(null);
      setWaitingTokens([]);
      setServedTokens([]);
      setNewDoctorName('');
      toast.success('Session ended');
      setActiveTab('history');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleActivateSession = async () => {
    if (!activeQueue) return;
    setFormIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/session/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeQueue.id }),
      });

      if (!response.ok) throw new Error('Failed to activate session');

      const updatedQueue = await response.json();
      setActiveQueue({ ...activeQueue, ...updatedQueue });
      toast.success('Session started! You can now call patients.');
      setActiveTab('overview');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleRegisterPatient = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeQueue) return;

    const name = newPatientName;
    const phone = newPatientPhone;

    // Clear inputs immediately for speed
    setNewPatientName('');
    setNewPatientPhone('');

    // Calculate estimated token number
    const lastTokenNum = Math.max(
      ...waitingTokens.map(t => t.token_number),
      ...servedTokens.map(t => t.token_number),
      0
    );
    const estTokenNum = lastTokenNum + 1;

    const tempId = `temp-${Date.now()}`;
    const tempToken: Token = {
      id: tempId,
      queue_id: activeQueue.id,
      patient_name: name,
      phone: phone,
      token_number: estTokenNum,
      status: 'waiting',
      created_at: new Date().toISOString(),
      clinic_id: clinic?.id || '',
      is_booked_online: false
    };

    // Optimistic Update
    setWaitingTokens(prev => [...prev, tempToken]);
    // Don't block the UI
    // setFormIsLoading(true); 

    try {
      const response = await fetch('/api/dashboard/token/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId: activeQueue.id,
          phone: phone,
          patientName: name
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to register token');
      }

      const newToken = await response.json();

      // Replace temp token with real one
      setWaitingTokens(prev => prev.map(t => t.id === tempId ? newToken : t));
      toast.success(`Token #${newToken.token_number} confirmed`);

    } catch (err: any) {
      // Revert on error
      setWaitingTokens(prev => prev.filter(t => t.id !== tempId));
      setNewPatientName(name);
      setNewPatientPhone(phone);
      toast.error(err.message);
    }
  };

  const handleCallNext = async () => {
    if (!activeQueue) return;

    // Snapshot for rollback
    const prevWaiting = [...waitingTokens];
    const prevServed = [...servedTokens];
    const prevClinic = clinic ? { ...clinic } : null;

    // Logic to determine next state
    const currentCalled = waitingTokens.find(t => t.status === 'called');
    // Find next waiting token (ensure sorted by token_number)
    const nextInLine = waitingTokens
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.token_number - b.token_number)[0];

    if (!currentCalled && !nextInLine) {
      toast.info('Queue is empty');
      return;
    }

    // Optimistic Updates
    let newWaiting = [...waitingTokens];
    let newServed = [...servedTokens];

    // 1. Serve Current
    if (currentCalled) {
      const servedToken = { ...currentCalled, status: 'served' as const };
      newWaiting = newWaiting.filter(t => t.id !== currentCalled.id);
      newServed = [servedToken, ...newServed];

      // Optimistic Balance
      // Optimistic Balance
      if (clinic && !isTrialActive(clinic)) {
        const newBalance = (clinic.prepaid_balance || 0) - 1;
        setClinic({ ...clinic, prepaid_balance: newBalance });
      }
    }

    // 2. Call Next
    if (nextInLine) {
      const calledToken = { ...nextInLine, status: 'called' as const };
      newWaiting = newWaiting.map(t => t.id === nextInLine.id ? calledToken : t);
      toast.success(`Calling Token #${calledToken.token_number}`);
    } else {
      toast.info('Patient served. Queue is empty.');
    }

    setWaitingTokens(newWaiting);
    setServedTokens(newServed);

    try {
      const response = await fetch('/api/dashboard/token/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId: activeQueue.id,
          currentCalledTokenId: currentCalled?.id
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to call next token');
      }

      // The server returns the actual updated tokens.
      // We can update state with them to be sure, or trust our optimistic update.
      // Since we have Real-time subscription, that will also fire and update state.
      // To avoid "jumping", we can ignore the response data if it matches our expectation,
      // or just let the Real-time handler do the final sync.

      // However, the Real-time handler might arrive BEFORE or AFTER this response.
      // If we update state here again, it might cause a flicker.
      // Best practice: Trust Optimistic, let Real-time fix drift.

    } catch (err: any) {
      // Rollback
      setWaitingTokens(prevWaiting);
      setServedTokens(prevServed);
      if (prevClinic) setClinic(prevClinic);
      toast.error(err.message);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to remove this patient from the queue?')) return;

    try {
      const response = await fetch(`/api/dashboard/token/${tokenId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete token');

      setWaitingTokens(waitingTokens.filter(t => t.id !== tokenId));
      toast.success('Patient removed from queue');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (pageIsLoading) return <PageLoading message="Loading Dashboard..." />;
  if (pageError) return <PageError message={pageError} />;
  if (!clinic) return null;

  const navItems: NavItem[] = [
    { label: 'Overview', value: 'overview', icon: PieChart },
    { label: 'Patient Booking', value: 'patient-booking', icon: Users },
    { label: 'Session History', value: 'history', icon: History },
    { label: 'Settings', value: 'settings', icon: Settings },
  ];

  const trialActive = isTrialActive(clinic, mounted ? new Date() : new Date(serverTime));

  return (
    <DashboardShell
      title={clinic.name}
      logoUrl={clinic.logo_url}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      userType="clinic"
    >
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
              <p className="text-gray-500 mt-1">Monitor queue status and call patients.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                {trialActive ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Trial Active
                  </span>
                ) : (
                  <>
                    <span className={`${lowBalanceWarning ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      Balance: ₹{clinic.prepaid_balance}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => setIsRechargeModalOpen(true)}
                    >
                      <PlusCircle className="w-3 h-3" /> Add
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {lowBalanceWarning && (
            <div className="bg-red-50 text-red-700 px-6 py-3 rounded-lg border border-red-100 flex items-center">
              ⚠️ Warning: Low balance. Please recharge to continue serving tokens.
            </div>
          )}

          {!activeQueue || activeQueue.status === 'waiting' ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {activeQueue ? 'Session Not Started' : 'No Active Session'}
              </h3>
              <p className="text-gray-500 mt-2 mb-6">
                {activeQueue
                  ? 'Doctor has not started the session yet. Go to Patient Booking to manage the queue.'
                  : 'Start a new session to begin managing the queue.'}
              </p>
              <Button onClick={() => setActiveTab('patient-booking')} className="bg-blue-600 hover:bg-blue-700">
                Go to Patient Booking
              </Button>
            </div>
          ) : (
            /* Active Session Dashboard */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Controls */}
              <div className="space-y-8">
                <SessionStatusCard
                  status={activeQueue.status as 'active' | 'paused'}
                  doctorName={activeQueue.doctor_name || 'Unknown Doctor'}
                  onToggleBreak={handleToggleBreak}
                  onEndSession={handleEndSession}
                />
              </div>

              {/* Middle Column: Current Token Display */}
              <QueueDisplay
                doctorName={activeQueue.doctor_name}
                doctorImageUrl={activeQueue.doctor_image_url}
                waitingTokens={waitingTokens}
                servedTokens={servedTokens}
                onCallNext={handleCallNext}
                isSessionActive={activeQueue.status === 'active'}
                onDeleteToken={handleDeleteToken}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'patient-booking' && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Booking</h1>
            <p className="text-gray-500 mt-1">Start sessions and register new patients.</p>
          </div>

          {!activeQueue ? (
            <>
              <StartSessionCard
                doctorName={newDoctorName}
                setDoctorName={setNewDoctorName}
                doctorImage={newDoctorImage}
                setDoctorImage={(file) => {
                  setNewDoctorImage(file);
                  if (file) setSelectedExistingImage(null);
                }}
                isLoading={formIsLoading}
                onSubmit={handleStartSession}
                recentDoctors={recentDoctors}
                onSelectRecent={(doc) => {
                  setNewDoctorName(doc.name);
                  setSelectedExistingImage(doc.imageUrl);
                  setNewDoctorImage(null);
                  toast.info(`Selected ${doc.name}`);
                }}
              />
            </>
          ) : (
            <>
              {activeQueue.status === 'waiting' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-8 animate-pulse">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Doctor is Arriving?</h3>
                  <p className="text-blue-700 mb-6">Booking is open. Click below when the doctor is ready to see patients.</p>
                  <div className="flex flex-col md:flex-row justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={handleActivateSession}
                      disabled={formIsLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-6 shadow-lg transform transition cursor-pointer hover:scale-105"
                    >
                      {formIsLoading ? 'Starting...' : 'Start Session'}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleEndSession}
                      disabled={formIsLoading}
                      className="bg-white hover:bg-red-50 text-red-600 border-red-200 font-bold text-lg px-8 py-6 shadow-sm transform transition cursor-pointer hover:scale-105"
                    >
                      Cancel Session
                    </Button>
                  </div>
                </div>
              )}

              <RegisterPatientCard
                doctorName={activeQueue.doctor_name}
                doctorImageUrl={activeQueue.doctor_image_url}
                patientName={newPatientName}
                setPatientName={setNewPatientName}
                patientPhone={newPatientPhone}
                setPatientPhone={setNewPatientPhone}
                isLoading={formIsLoading}
                isSessionActive={['active', 'waiting'].includes(activeQueue.status)}
                onSubmit={handleRegisterPatient}
              />

              <div className="mt-8">
                <QueueDisplay
                  doctorName={activeQueue.doctor_name}
                  doctorImageUrl={activeQueue.doctor_image_url}
                  waitingTokens={waitingTokens}
                  servedTokens={servedTokens}
                  onCallNext={handleCallNext}
                  isSessionActive={activeQueue.status === 'active'}
                  onDeleteToken={handleDeleteToken}
                  showControls={false}
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
            <p className="text-gray-500 mt-1">View records of past clinic sessions.</p>
          </div>

          {pastSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No past sessions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastSessions.map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow max-w-sm">
                  {session.doctor_image_url ? (
                    <img src={session.doctor_image_url} alt={session.doctor_name} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xl">
                      {session.doctor_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{session.doctor_name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{new Date(session.created_at).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        Ended
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {/* @ts-ignore */}
                        {session.served_count || 0} Patients Served
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex items-center justify-center h-full text-gray-500">
          Settings coming soon...
        </div>
      )}

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onOpenChange={setIsRechargeModalOpen}
      />
    </DashboardShell>
  );
}