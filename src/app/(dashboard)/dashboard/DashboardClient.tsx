'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic, Queue, Token } from '@/lib/types';
import { toast } from 'sonner';
import { RechargeModal } from '@/components/dashboard/RechargeModal';
import { PieChart, Settings, Users, History, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';
import { PageLoading } from '@/components/shared/PageLoading';
import { PageError } from '@/components/shared/PageError';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { BookingTab } from '@/components/dashboard/tabs/BookingTab';
import { HistoryTab } from '@/components/dashboard/tabs/HistoryTab';

interface DashboardClientProps {
  initialClinic: Clinic | null;
  initialActiveQueues: Queue[];
  initialTokens: Token[];
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
  initialActiveQueues,
  initialTokens,
  serverTime
}: DashboardClientProps) {
  const [supabase] = useState(() => createClient());
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
  const [activeQueues, setActiveQueues] = useState<Queue[]>(initialActiveQueues);
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [pastSessions, setPastSessions] = useState<Queue[]>([]);

  // Selection State
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  // Derived Data
  const activeQueue = activeQueues.find(q => q.id === selectedQueueId) || null;
  const waitingTokens = tokens.filter(t => t.queue_id === selectedQueueId && (t.status === 'waiting' || t.status === 'called')).sort((a, b) => a.token_number - b.token_number);
  const servedTokens = tokens.filter(t => t.queue_id === selectedQueueId && (t.status === 'served' || t.status === 'no_show')).sort((a, b) => (b.served_at || '').localeCompare(a.served_at || ''));
  // Low balance warning removed for postpaid model

  // Form state
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorImage, setNewDoctorImage] = useState<File | null>(null);
  const [newDoctorArrivalTime, setNewDoctorArrivalTime] = useState('');
  const [selectedExistingImage, setSelectedExistingImage] = useState<string | null>(null);
  const [recentDoctors, setRecentDoctors] = useState<any[]>([]);
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPurpose, setNewPatientPurpose] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'patient-booking' && recentDoctors.length === 0) {
      fetchRecentDoctors();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'history' && pastSessions.length === 0) {
      fetchHistory();
    }
  }, [activeTab]);

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
        body: JSON.stringify({ doctorName: newDoctorName, doctorImageUrl, doctorArrivalTime: newDoctorArrivalTime }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to start session');
      }

      const newQueue = await response.json();
      setActiveQueues(prev => [newQueue, ...prev]);
      setSelectedQueueId(newQueue.id);
      setNewDoctorName('');
      setNewDoctorImage(null);
      setNewDoctorArrivalTime('');
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
      setActiveQueues(prev => prev.map(q => q.id === updatedQueue.id ? updatedQueue : q));
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

      setActiveQueues(prev => prev.filter(q => q.id !== activeQueue.id));
      setSelectedQueueId(null);
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
      setActiveQueues(prev => prev.map(q => q.id === updatedQueue.id ? { ...q, ...updatedQueue } : q));
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
    const purpose = newPatientPurpose;

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
    setTokens(prev => [...prev, tempToken]);
    // Don't block the UI
    // setFormIsLoading(true); 

    try {
      const response = await fetch('/api/dashboard/token/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId: activeQueue.id,
          phone: phone,
          patientName: name,
          purpose
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to register token');
      }

      const newToken = await response.json();

      // Replace temp token with real one
      setTokens(prev => prev.map(t => t.id === tempId ? newToken : t));
      toast.success(`Token #${newToken.token_number} generated`);

    } catch (err: any) {
      // Revert on error
      setTokens(prev => prev.filter(t => t.id !== tempId));
      setNewPatientName(name);
      setNewPatientPhone(phone);
      setNewPatientPurpose(purpose);
      toast.error(err.message);
    }
  };

  const handleCallNext = async (queueId?: string) => {
    const targetQueueId = queueId || activeQueue?.id;
    if (!targetQueueId) return;

    const targetQueue = activeQueues.find(q => q.id === targetQueueId);
    if (!targetQueue) return;

    // Snapshot for rollback
    const prevTokens = [...tokens];
    const prevClinic = clinic ? { ...clinic } : null;

    // Logic to determine next state
    const queueTokens = tokens.filter(t => t.queue_id === targetQueueId);
    const queueWaitingTokens = queueTokens
      .filter(t => t.status === 'waiting' || t.status === 'called')
      .sort((a, b) => a.token_number - b.token_number);

    const currentCalled = queueWaitingTokens.find(t => t.status === 'called');
    // Find next waiting token (ensure sorted by token_number)
    const nextInLine = queueWaitingTokens
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.token_number - b.token_number)[0];

    if (!currentCalled && !nextInLine) {
      toast.info('Queue is empty');
      return;
    }

    // Optimistic Updates
    let newTokens = [...tokens];

    // 1. Serve Current
    if (currentCalled) {
      newTokens = newTokens.map(t => t.id === currentCalled.id ? { ...t, status: 'served' } : t);

      // Optimistic Billing
      if (clinic && !isTrialActive(clinic)) {
        const newDue = (clinic.current_due || 0) + 1;
        setClinic({ ...clinic, current_due: newDue });
      }
    }

    // 2. Call Next
    if (nextInLine) {
      const calledToken = { ...nextInLine, status: 'called' as const };
      newTokens = newTokens.map(t => t.id === nextInLine.id ? calledToken : t);
      toast.success(`Calling Token #${calledToken.token_number}`);
    } else {
      toast.info('Patient served. Queue is empty.');
    }

    setTokens(newTokens);

    try {
      const response = await fetch('/api/dashboard/token/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId: targetQueueId,
          currentCalledTokenId: currentCalled?.id
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to call next token');
      }

      // Best practice: Trust Optimistic, let Real-time fix drift.

    } catch (err: any) {
      // Rollback
      setTokens(prevTokens);
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

      setTokens(prev => prev.filter(t => t.id !== tokenId));
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

  const getBalanceColor = () => {
    const day = new Date().getDate();
    if (day <= 10) return 'text-green-600';
    if (day <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                    <span className="font-bold flex items-center gap-1">
                      <span className="text-gray-900">Current Bill:</span>
                      <span className={getBalanceColor()}>₹{clinic.current_due}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      onClick={() => setIsRechargeModalOpen(true)}
                    >
                      <IndianRupee className="w-3 h-3" /> Pay Bill
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <OverviewTab
            isLoading={isLoading}
            activeQueues={activeQueues}
            tokens={tokens}
            selectedQueueId={selectedQueueId}
            setSelectedQueueId={setSelectedQueueId}
            setActiveTab={setActiveTab}
            activeQueue={activeQueue}
            waitingTokens={waitingTokens}
            servedTokens={servedTokens}
            onToggleBreak={handleToggleBreak}
            onEndSession={handleEndSession}
            onCallNext={handleCallNext}
            onDeleteToken={handleDeleteToken}
          />
        </div>
      )}

      {activeTab === 'patient-booking' && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Booking</h1>
            <p className="text-gray-500 mt-1">Start sessions and register new patients.</p>
          </div>

          <BookingTab
            isLoading={isLoading}
            activeQueues={activeQueues}
            tokens={tokens}
            selectedQueueId={selectedQueueId}
            setSelectedQueueId={setSelectedQueueId}
            activeQueue={activeQueue}
            waitingTokens={waitingTokens}
            servedTokens={servedTokens}
            formIsLoading={formIsLoading}
            onStartSession={handleStartSession}
            onActivateSession={handleActivateSession}
            onEndSession={handleEndSession}
            onRegisterPatient={handleRegisterPatient}
            onCallNext={handleCallNext}
            onDeleteToken={handleDeleteToken}
            newDoctorName={newDoctorName}
            setNewDoctorName={setNewDoctorName}
            newDoctorImage={newDoctorImage}
            setNewDoctorImage={setNewDoctorImage}
            setSelectedExistingImage={setSelectedExistingImage}
            newDoctorArrivalTime={newDoctorArrivalTime}
            setNewDoctorArrivalTime={setNewDoctorArrivalTime}
            recentDoctors={recentDoctors}
            newPatientName={newPatientName}
            setNewPatientName={setNewPatientName}
            newPatientPhone={newPatientPhone}
            setNewPatientPhone={setNewPatientPhone}
            newPatientPurpose={newPatientPurpose}
            setNewPatientPurpose={setNewPatientPurpose}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <HistoryTab
          pastSessions={pastSessions}
          isLoading={isLoading}
        />
      )}

      {
        activeTab === 'settings' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Settings coming soon...
          </div>
        )
      }

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onOpenChange={setIsRechargeModalOpen}
      />
    </DashboardShell >
  );
}