'use client';

import { APP_NAME } from '@/lib/config';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic, PaymentRequest } from '@/lib/types';
import { toast } from 'sonner';
import { LayoutDashboard, Building2, Settings, QrCode, IndianRupee } from 'lucide-react';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';
import { AdminStatsCharts } from '@/components/admin/AdminStatsCharts';
import { CreateClinicDialog } from '@/components/admin/CreateClinicDialog';
import { EditClinicDialog } from '@/components/admin/EditClinicDialog';
import { DeleteClinicAlert } from '@/components/admin/DeleteClinicAlert';
import { StatsGridSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { adminService } from '@/services/admin';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

// Tabs
import { ClinicsTab } from '@/components/admin/tabs/ClinicsTab';
import { PaymentsTab } from '@/components/admin/tabs/PaymentsTab';
import { UpiSettingsTab } from '@/components/admin/tabs/UpiSettingsTab';
import { SettingsTab } from '@/components/admin/tabs/SettingsTab';

interface AdminClientProps {
  initialClinics: Clinic[];
}

export function AdminClient({ initialClinics }: AdminClientProps) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  // Page-level state
  const [activeTab, setActiveTab] = useState('overview');

  // Data state
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [searchQuery, setSearchQuery] = useState('');

  const [trialDates, setTrialDates] = useState<{ [key: string]: { start: string, end: string } }>({});
  const [trialDurations, setTrialDurations] = useState<{ [key: string]: number }>({});

  interface AdminStatsData {
    totalClinics: number;
    totalPatientsToday: number;
    totalRevenue: number;
    lastMonthRevenue: number;
    patientsTrend?: { date: string; value: number }[];
    revenueTrend?: { date: string; value: number }[];
  }

  const [stats, setStats] = useState<AdminStatsData>({
    totalClinics: 0,
    totalPatientsToday: 0,
    totalRevenue: 0,
    lastMonthRevenue: 0,
    patientsTrend: [],
    revenueTrend: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // UPI Settings State
  const [upiSettings, setUpiSettings] = useState({ upi_id: '' });

  const [settingsLoading, setSettingsLoading] = useState(false);

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  // Fetch Payment Requests
  useEffect(() => {
    if (activeTab === 'payment-requests') {
      adminService.fetchPaymentRequests()
        .then(data => setPaymentRequests(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', amount?: number) => {
    try {
      await adminService.approvePaymentRequest(requestId, action);

      toast.success(`Request ${action}d`);
      setPaymentRequests(prev => prev.filter(r => r.id !== requestId));

      if (action === 'approve' && amount) {
        setStats(prev => ({
          ...prev,
          totalRevenue: prev.totalRevenue + amount
        }));
      }

      fetchStats(); // Refresh stats to update revenue immediately
    } catch (err: unknown) {
      toast.error('Failed to process request', {
        description: err instanceof Error ? err.message : 'Could not approve/reject payment.'
      });
    }
  };

  // Fetch UPI Settings
  useEffect(() => {
    if (activeTab === 'upi-settings') {
      adminService.fetchSettings()
        .then(data => setUpiSettings({
          upi_id: data.upi_id || ''
        }))
        .catch(err => {
          console.error(err);
          toast.error('Failed to load settings', {
            description: 'Could not fetch UPI settings.'
          });
        });
    }
  }, [activeTab]);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await adminService.saveSettings(upiSettings);

      setUpiSettings(prev => ({ ...prev }));
      toast.success('Settings saved');
    } catch (err: unknown) {
      toast.error('Failed to save settings', {
        description: err instanceof Error ? err.message : 'Could not update UPI settings.'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const navItems: NavItem[] = [
    { label: 'Overview', value: 'overview', icon: LayoutDashboard },
    { label: 'Clinics', value: 'clinics', icon: Building2 },
    { label: 'Bill Payments', value: 'payment-requests', icon: IndianRupee },
    { label: 'UPI Settings', value: 'upi-settings', icon: QrCode },
    { label: 'Settings', value: 'settings', icon: Settings },
  ];

  // Fetch Stats Helper
  const fetchStats = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoadingStats(true);
    try {
      const data = await adminService.fetchStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
      toast.error('Failed to load stats', {
        description: 'Could not fetch dashboard statistics.'
      });
    } finally {
      if (showLoading) setIsLoadingStats(false);
    }
  }, []);

  // Fetch Clinic Stats Map (Served Today)
  const fetchClinicStats = useCallback(async () => {
    try {
      const counts = await adminService.fetchClinicStatsMap();
      setClinics(prev => prev.map(c => ({
        ...c,
        served_today_count: counts[c.id] || 0
      })));
    } catch (error) {
      console.error('Failed to fetch clinic stats', error);
      toast.error('Failed to load clinic data', {
        description: 'Could not fetch served patient counts.'
      });
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'payment-requests') {
      setIsLoadingPayments(true);
      fetch('/api/admin/recharge/requests')
        .then(res => res.json())
        .then(data => setPaymentRequests(data))
        .catch(err => {
          console.error(err);
          toast.error('Failed to load payments', {
            description: 'Could not fetch pending payment requests.'
          });
        })
        .finally(() => setIsLoadingPayments(false));
    }
  }, [activeTab]);

  // Real-time Subscriptions
  useAdminRealtime({
    supabase,
    setClinics,
    setStats,
    setPaymentRequests,
    activeTab,
    fetchStats,
    fetchClinicStats
  });

  // Modal/Dialog state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Form state (Create/Edit)
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicSlug, setNewClinicSlug] = useState('');
  const [newClinicLocation, setNewClinicLocation] = useState('');
  const [newClinicContactNumber, setNewClinicContactNumber] = useState('');
  const [newClinicLogo, setNewClinicLogo] = useState<File | null>(null);
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [newClinicPassword, setNewClinicPassword] = useState('');
  const [editClinicLogoUrl, setEditClinicLogoUrl] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);

  const handleLogout = async () => {
    toast.info('Logging out...');
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: Force hard reload to login page
      window.location.href = '/login';
    }
  };

  // --- Handlers ---

  const handleCreateClinic = async (e: FormEvent) => {
    e.preventDefault();
    setFormIsLoading(true);

    try {
      // 1. Upload Logo if exists
      let logoUrl = '';
      if (newClinicLogo) {
        const fileExt = newClinicLogo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('clinic-logos')
          .upload(fileName, newClinicLogo);

        if (uploadError) throw new Error('Logo upload failed');

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // 2. Create Clinic
      const { clinic: newClinic } = await adminService.createClinic({
        name: newClinicName,
        slug: newClinicSlug,
        location: newClinicLocation,
        contactNumber: newClinicContactNumber,
        logoUrl: logoUrl,
        compounderEmail: newClinicEmail,
        compounderPassword: newClinicPassword,
        initialBalance: 0
      });
      setClinics(prev => {
        if (prev.some(c => c.id === newClinic.id)) return prev;
        return [...prev, newClinic];
      });
      setIsCreateModalOpen(false);

      // Reset form
      setNewClinicName('');
      setNewClinicSlug('');
      setNewClinicLocation('');
      setNewClinicContactNumber('');
      setNewClinicLogo(null);
      setNewClinicEmail('');
      setNewClinicPassword('');
      toast.success('Clinic created successfully');

    } catch (err: unknown) {
      toast.error('Failed to create clinic', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.'
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleEditClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setNewClinicName(clinic.name);
    setNewClinicSlug(clinic.slug);
    setNewClinicLocation(clinic.location || '');
    setNewClinicContactNumber(clinic.contact_number || '');
    setEditClinicLogoUrl(clinic.logo_url || '');
    setNewClinicPassword('');
    setNewClinicLogo(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateClinic = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;
    setFormIsLoading(true);

    try {
      let logoUrl = editClinicLogoUrl;

      // Upload new logo if selected
      if (newClinicLogo) {
        const fileExt = newClinicLogo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('clinic-logos')
          .upload(fileName, newClinicLogo);

        if (uploadError) throw new Error('Logo upload failed');

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const updatedClinic = await adminService.updateClinic(selectedClinic.id, {
        name: newClinicName,
        slug: newClinicSlug,
        location: newClinicLocation,
        contactNumber: newClinicContactNumber,
        logoUrl: logoUrl,
        password: newClinicPassword || undefined
      });
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      setIsEditModalOpen(false);
      toast.success('Clinic updated successfully');

    } catch (err: unknown) {
      toast.error('Failed to update clinic', {
        description: err instanceof Error ? err.message : 'Could not save changes.'
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const clinic = clinics.find(c => c.id === id);
    if (clinic) {
      setSelectedClinic(clinic);
      setIsDeleteAlertOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClinic) return;

    try {
      await adminService.deleteClinic(selectedClinic.id);

      setClinics(clinics.filter(c => c.id !== selectedClinic.id));
      setIsDeleteAlertOpen(false);
      toast.success('Clinic deleted successfully');
    } catch (err: unknown) {
      toast.error('Failed to delete clinic', {
        description: err instanceof Error ? err.message : 'Could not remove clinic.'
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updatedClinic = await adminService.toggleStatus(id, !currentStatus);
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      toast.success(`Clinic ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: unknown) {
      toast.error('Failed to update status', {
        description: err instanceof Error ? err.message : 'Could not toggle clinic status.'
      });
    }
  };

  const handleTrialDurationChange = (id: string, days: number) => {
    setTrialDurations(prev => ({
      ...prev,
      [id]: days
    }));
  };

  const handleTrialDateChange = (id: string, type: 'start' | 'end', value: string) => {
    setTrialDates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: value
      }
    }));
  };

  const handleToggleTrial = async (id: string, isActive: boolean) => {
    if (!isActive) {
      // Turn off trial
      try {
        const updatedClinic = await adminService.toggleTrial(id, null, null);
        setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
        toast.success('Trial mode disabled');
      } catch (err: unknown) {
        toast.error('Failed to disable trial', {
          description: err instanceof Error ? err.message : 'Could not update trial status.'
        });
      }
    } else {
      // Turn on trial
      let start = trialDates[id]?.start;
      let end = trialDates[id]?.end;

      // Set defaults if missing
      if (!start || !end) {
        const today = new Date();
        const days = trialDurations[id] || 14; // Use custom duration or default 14

        const endDate = new Date();
        endDate.setDate(today.getDate() + days);

        start = today.toISOString().split('T')[0];
        end = endDate.toISOString().split('T')[0];

        // Also update the dates state for immediate reflection if they open date picker
        setTrialDates(prev => ({
          ...prev,
          [id]: { start, end }
        }));
      }

      try {
        const updatedClinic = await adminService.toggleTrial(id, start, end);
        setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
        toast.success(`Trial mode enabled for ${trialDurations[id] || 14} days`);
      } catch (err: unknown) {
        toast.error('Failed to enable trial', {
          description: err instanceof Error ? err.message : 'Could not update trial status.'
        });
      }
    }
  };

  // --- Derived Data ---
  const filteredClinics = clinics.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell
      title={`${APP_NAME} Admin`}
      subtitle="Super Admin Console"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      userType="admin"
    >
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
          </div>
          <ErrorBoundary name="Admin Stats">
            {isLoadingStats ? (
              <StatsGridSkeleton />
            ) : (
              <AdminStatsCharts
                totalClinics={stats.totalClinics}
                totalPatientsToday={stats.totalPatientsToday}
                totalRevenue={stats.totalRevenue}
                lastMonthRevenue={stats.lastMonthRevenue}
                patientsTrend={stats.patientsTrend}
                revenueTrend={stats.revenueTrend}
              />
            )}
          </ErrorBoundary>
        </div>
      )}

      {activeTab === 'clinics' && (
        <ClinicsTab
          clinics={filteredClinics}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewClinicClick={() => setIsCreateModalOpen(true)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          onToggleTrial={handleToggleTrial}
          trialDates={trialDates}
          onTrialDateChange={handleTrialDateChange}
          trialDurations={trialDurations}
          onTrialDurationChange={handleTrialDurationChange}
        />
      )}

      {activeTab === 'settings' && <SettingsTab />}

      {activeTab === 'payment-requests' && (
        <PaymentsTab
          paymentRequests={paymentRequests}
          isLoading={isLoadingPayments}
          onAction={handleRequestAction}
        />
      )}

      {activeTab === 'upi-settings' && (
        <UpiSettingsTab
          upiSettings={upiSettings}
          setUpiSettings={setUpiSettings}
          onSave={handleSaveSettings}
          isLoading={settingsLoading}
        />
      )}

      {/* Dialogs */}
      <CreateClinicDialog
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateClinic}
        isLoading={formIsLoading}
        name={newClinicName}
        setName={setNewClinicName}
        slug={newClinicSlug}
        setSlug={setNewClinicSlug}
        location={newClinicLocation}
        setLocation={setNewClinicLocation}
        contactNumber={newClinicContactNumber}
        setContactNumber={setNewClinicContactNumber}
        logoFile={newClinicLogo}
        setLogoFile={setNewClinicLogo}
        email={newClinicEmail}
        setEmail={setNewClinicEmail}
        password={newClinicPassword}
        setPassword={setNewClinicPassword}
      />

      <EditClinicDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateClinic}
        isLoading={formIsLoading}
        name={newClinicName}
        setName={setNewClinicName}
        slug={newClinicSlug}
        setSlug={setNewClinicSlug}
        location={newClinicLocation}
        setLocation={setNewClinicLocation}
        contactNumber={newClinicContactNumber}
        setContactNumber={setNewClinicContactNumber}
        logoUrl={editClinicLogoUrl}
        logoFile={newClinicLogo}
        setLogoFile={setNewClinicLogo}
        password={newClinicPassword}
        setPassword={setNewClinicPassword}
      />

      <DeleteClinicAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
}