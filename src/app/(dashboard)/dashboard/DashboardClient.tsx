'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic, Queue, Token, RecentDoctor } from '@/lib/types';
import { toast } from 'sonner';
import { RechargeModal } from '@/components/dashboard/RechargeModal';
import { PieChart, Settings, Users, History, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';
import { TrialCountdown } from '@/components/dashboard/TrialCountdown';

import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { BookingTab } from '@/components/dashboard/tabs/BookingTab';
import { HistoryTab } from '@/components/dashboard/tabs/HistoryTab';
import { ReportsTab } from '@/components/dashboard/tabs/ReportsTab';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { dashboardService } from '@/services/dashboard';

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
  const [recentDoctors, setRecentDoctors] = useState<RecentDoctor[]>([]);
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPurpose, setNewPatientPurpose] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);


  const handleLogout = useCallback(async () => {
    try {
      toast.success('Logging out...');
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  }, [supabase]);

  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Fetch history
  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await dashboardService.fetchHistory();
      setPastSessions(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
      toast.error('Failed to load history', {
        description: 'Could not fetch past sessions. Please try again later.'
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch recent doctors
  const fetchRecentDoctors = async () => {
    try {
      const data = await dashboardService.fetchRecentDoctors();
      setRecentDoctors(data);
    } catch (error) {
      console.error('Failed to fetch recent doctors', error);
      toast.error('Failed to load doctors', {
        description: 'Could not fetch recent doctors list.'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'patient-booking' && recentDoctors.length === 0) {
      fetchRecentDoctors();
    }
  }, [activeTab, recentDoctors.length]);

  useEffect(() => {
    if (activeTab === 'history' && pastSessions.length === 0) {
      fetchHistory();
    }
  }, [activeTab, pastSessions.length]);

  // Real-time subscription for clinic updates
  // Real-time subscription
  useRealtimeDashboard({
    supabase,
    clinic,
    activeQueues,
    selectedQueueId,
    setClinic,
    setActiveQueues,
    setPastSessions,
    setTokens,
    router,
    setSelectedQueueId
  });

  // Handlers
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleStartSession = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction('start-session');
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

      const newQueue = await dashboardService.startSession({
        doctorName: newDoctorName,
        doctorImageUrl,
        doctorArrivalTime: newDoctorArrivalTime
      });
      setActiveQueues(prev => {
        if (prev.some(q => q.id === newQueue.id)) return prev;
        return [newQueue, ...prev];
      });
      setSelectedQueueId(newQueue.id);
      setNewDoctorName('');
      setNewDoctorImage(null);
      setNewDoctorArrivalTime('');
      setSelectedExistingImage(null);
      toast.success('Session started successfully');
    } catch (err: unknown) {
      toast.error('Failed to start session', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.'
      });
    } finally {
      setFormIsLoading(false);
      setLoadingAction(null);
    }
  }, [loadingAction, newDoctorImage, selectedExistingImage, supabase, newDoctorName, newDoctorArrivalTime]);

  const handleToggleBreak = useCallback(async () => {
    if (!activeQueue || loadingAction) return;
    const newStatus = activeQueue.status === 'active' ? 'paused' : 'active';
    setLoadingAction('toggle-break');

    try {
      const updatedQueue = await dashboardService.toggleBreak(activeQueue.id, newStatus);
      setActiveQueues(prev => prev.map(q => q.id === updatedQueue.id ? updatedQueue : q));
      toast.success(newStatus === 'paused' ? 'Session paused' : 'Session resumed');
    } catch (err: unknown) {
      toast.error('Failed to update session status', {
        description: err instanceof Error ? err.message : 'Could not toggle break mode.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [activeQueue, loadingAction]);

  const handleEndSession = useCallback(async () => {
    if (!activeQueue || loadingAction) return;
    if (!confirm('Are you sure you want to end the session? This will clear the current queue.')) return;
    setLoadingAction('end-session');

    try {
      await dashboardService.endSession(activeQueue.id);

      setActiveQueues(prev => prev.filter(q => q.id !== activeQueue.id));
      setSelectedQueueId(null);
      setNewDoctorName('');
      toast.success('Session ended');
      setActiveTab('history');
    } catch (err: unknown) {
      toast.error('Failed to end session', {
        description: err instanceof Error ? err.message : 'Could not complete the request.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [activeQueue, loadingAction]);

  const handleCancelSession = useCallback(async () => {
    if (!activeQueue || loadingAction) return;
    if (!confirm('Are you sure you want to CANCEL this session? This indicates the doctor did not arrive.')) return;
    setLoadingAction('cancel-session');

    try {
      await dashboardService.cancelSession(activeQueue.id);

      const cancelledQueue = { ...activeQueue, status: 'cancelled' as const, ended_at: new Date().toISOString() };

      setActiveQueues(prev => prev.filter(q => q.id !== activeQueue.id));
      setPastSessions(prev => {
        if (prev.some(q => q.id === cancelledQueue.id)) return prev;
        return [cancelledQueue, ...prev];
      });

      setSelectedQueueId(null);
      setNewDoctorName('');
      toast.success('Session cancelled');
      setActiveTab('history');
    } catch (err: unknown) {
      toast.error('Failed to cancel session', {
        description: err instanceof Error ? err.message : 'Could not cancel the session.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [activeQueue, loadingAction]);

  const handleActivateSession = useCallback(async () => {
    if (!activeQueue || loadingAction) return;
    setLoadingAction('activate-session');
    setFormIsLoading(true);
    try {
      const updatedQueue = await dashboardService.activateSession(activeQueue.id);
      setActiveQueues(prev => prev.map(q => q.id === updatedQueue.id ? { ...q, ...updatedQueue } : q));
      toast.success('Session started! You can now call patients.');
      setActiveTab('overview');
    } catch (err: unknown) {
      toast.error('Failed to activate session', {
        description: err instanceof Error ? err.message : 'Could not activate the session.'
      });
    } finally {
      setFormIsLoading(false);
      setLoadingAction(null);
    }
  }, [activeQueue, loadingAction]);

  const handleRegisterPatient = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!activeQueue || loadingAction) return;

    const name = newPatientName;
    const phone = newPatientPhone;
    const purpose = newPatientPurpose;

    // Clear inputs immediately for speed
    setNewPatientName('');
    setNewPatientPhone('');

    setLoadingAction('register-patient');

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
      const newToken = await dashboardService.registerPatient({
        queueId: activeQueue.id,
        phone: phone,
        patientName: name,
        purpose
      });

      // Replace temp token with real one
      setTokens(prev => prev.map(t => t.id === tempId ? newToken : t));
      toast.success(`Token #${newToken.token_number} generated`);

    } catch (err: unknown) {
      // Revert on error
      setTokens(prev => prev.filter(t => t.id !== tempId));
      setNewPatientName(name);
      setNewPatientPhone(phone);
      setNewPatientPurpose(purpose);
      toast.error('Failed to register patient', {
        description: err instanceof Error ? err.message : 'Could not add patient to queue.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [activeQueue, loadingAction, newPatientName, newPatientPhone, newPatientPurpose, waitingTokens, servedTokens, clinic]);

  const handleCallNext = useCallback(async (queueId?: string) => {
    if (loadingAction) return;
    const targetQueueId = queueId || activeQueue?.id;
    if (!targetQueueId) return;

    const targetQueue = activeQueues.find(q => q.id === targetQueueId);
    if (!targetQueue) return;

    setLoadingAction('call-next');

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
      setLoadingAction(null);
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
      await dashboardService.callNext(targetQueueId, currentCalled?.id);

      // Best practice: Trust Optimistic, let Real-time fix drift.

    } catch (err: unknown) {
      // Rollback
      setTokens(prevTokens);
      if (prevClinic) setClinic(prevClinic);
      toast.error('Failed to call next patient', {
        description: err instanceof Error ? err.message : 'Could not update queue status.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [loadingAction, activeQueue, activeQueues, tokens, clinic]);

  const handleMarkAbsent = useCallback(async () => {
    if (loadingAction) return;
    const targetQueueId = activeQueue?.id;
    if (!targetQueueId) return;

    setLoadingAction('mark-absent');

    // Snapshot for rollback
    const prevTokens = [...tokens];

    // Logic to determine next state
    const queueTokens = tokens.filter(t => t.queue_id === targetQueueId);
    const queueWaitingTokens = queueTokens
      .filter(t => t.status === 'waiting' || t.status === 'called')
      .sort((a, b) => a.token_number - b.token_number);

    const currentCalled = queueWaitingTokens.find(t => t.status === 'called');

    if (!currentCalled) {
      setLoadingAction(null);
      return; // Can only mark absent if someone is called
    }

    // Find next waiting token
    const nextInLine = queueWaitingTokens
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.token_number - b.token_number)[0];

    // Optimistic Updates
    let newTokens = [...tokens];

    // 1. Mark Current as Absent (No Show)
    newTokens = newTokens.map(t => t.id === currentCalled.id ? { ...t, status: 'no_show' } : t);

    // NOTE: We do NOT update clinic balance here (Billing skipped)

    // 2. Call Next (if any)
    if (nextInLine) {
      const calledToken = { ...nextInLine, status: 'called' as const };
      newTokens = newTokens.map(t => t.id === nextInLine.id ? calledToken : t);
      toast.info(`Marked Absent. Calling Token #${calledToken.token_number}`);
    } else {
      toast.info('Patient marked absent. Queue is empty.');
    }

    setTokens(newTokens);

    try {
      await dashboardService.markAbsent(targetQueueId, currentCalled.id);
    } catch (err: unknown) {
      // Rollback
      setTokens(prevTokens);
      toast.error('Failed to mark absent', {
        description: err instanceof Error ? err.message : 'Could not update status.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [loadingAction, activeQueue, tokens]);

  const handleDeleteToken = useCallback(async (tokenId: string) => {
    if (loadingAction) return;
    if (!confirm('Are you sure you want to remove this patient from the queue?')) return;

    setLoadingAction(`delete-token-${tokenId}`);

    try {
      await dashboardService.deleteToken(tokenId);

      setTokens(prev => prev.filter(t => t.id !== tokenId));
      toast.success('Patient removed from queue');
    } catch (err: unknown) {
      toast.error('Failed to remove patient', {
        description: err instanceof Error ? err.message : 'Could not delete token.'
      });
    } finally {
      setLoadingAction(null);
    }
  }, [loadingAction]);


  if (!clinic) return null;

  const navItems: NavItem[] = [
    { label: 'Overview', value: 'overview', icon: PieChart },
    { label: 'Patient Booking', value: 'patient-booking', icon: Users },
    { label: 'Session History', value: 'history', icon: History },
    { label: 'Reports', value: 'reports', icon: PieChart },
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
      trialEndDate={trialActive ? clinic.trial_end_date : undefined}
    >
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
              <p className="text-slate-500 mt-1">Monitor queue status and call patients.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
                {trialActive ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Trial Active
                    <div className="ml-2 pl-2 border-l border-slate-200">
                      <TrialCountdown endDate={clinic.trial_end_date!} />
                    </div>
                  </span>
                ) : (
                  <>
                    <span className="font-bold flex items-center gap-1">
                      <span className="text-slate-900">Current Bill:</span>
                      <span className={getBalanceColor()}>₹{clinic.current_due}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:text-teal-800"
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
            isLoading={false}
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
            onMarkAbsent={handleMarkAbsent}
            onDeleteToken={handleDeleteToken}
            loadingAction={loadingAction}
          />
        </div>
      )}

      {activeTab === 'patient-booking' && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Patient Booking</h1>
            <p className="text-slate-500 mt-1">Start sessions and register new patients.</p>
          </div>

          <BookingTab
            isLoading={false}
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

            onCancelSession={handleCancelSession}
            onRegisterPatient={handleRegisterPatient}
            onCallNext={handleCallNext}
            onMarkAbsent={handleMarkAbsent}
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
            loadingAction={loadingAction}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <HistoryTab
          pastSessions={pastSessions}
          isLoading={isHistoryLoading}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsTab />
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
        fixedAmount={clinic?.current_due || 0}
      />
    </DashboardShell >
  );
}