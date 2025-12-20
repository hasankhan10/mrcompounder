'use client';

import { APP_NAME } from '@/lib/config';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Clinic } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LayoutDashboard, Building2, Settings, Stethoscope } from 'lucide-react';


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
import { SettingsTab } from '@/components/admin/tabs/SettingsTab';
import { DoctorsTab } from '@/components/admin/tabs/DoctorsTab';

interface AdminClientProps {
  initialClinics: Clinic[];
}

export function AdminClient({ initialClinics }: AdminClientProps) {
  const [supabase] = useState(() => createClient());
  // const router = useRouter();

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

  // Doctors State
  const [doctors, setDoctors] = useState<import('@/lib/types').Doctor[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);

  // Fetch Doctors Helper
  const fetchDoctors = useCallback(async () => {
    setIsDoctorsLoading(true);
    try {
      const data = await adminService.fetchDoctors();
      setDoctors(data.doctors);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    } finally {
      setIsDoctorsLoading(false);
    }
  }, []);



  const navItems: NavItem[] = [
    { label: 'Overview', value: 'overview', icon: LayoutDashboard },
    { label: 'Clinics', value: 'clinics', icon: Building2 },
    { label: 'Doctors', value: 'doctors', icon: Stethoscope },
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
        served_today_count: (counts[c.id] as number) || 0
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
    fetchClinicStats();
    fetchDoctors();
  }, [fetchStats, fetchClinicStats, fetchDoctors]);

  // Real-time Subscriptions
  useAdminRealtime({
    supabase,
    setClinics,
    setStats,
    activeTab,
    fetchStats,
    fetchClinicStats
  });

  // Modal/Dialog state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Doctor Delete State
  const [isDeleteDoctorAlertOpen, setIsDeleteDoctorAlertOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  /* ... */

  const handleDeleteDoctor = (id: string) => {
    setSelectedDoctorId(id);
    setIsDeleteDoctorAlertOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!selectedDoctorId) return;
    try {
      await adminService.deleteDoctor(selectedDoctorId);
      toast.success("Doctor deleted successfully");
      setDoctors(prev => prev.filter(d => d.id !== selectedDoctorId));
      setIsDeleteDoctorAlertOpen(false);
      setSelectedDoctorId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete doctor");
    }
  };

  // Form state (Create/Edit)
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicSlug, setNewClinicSlug] = useState('');
  const [newClinicLocation, setNewClinicLocation] = useState('');
  const [newClinicContactNumber, setNewClinicContactNumber] = useState('');
  const [newClinicLogo, setNewClinicLogo] = useState<File | null>(null);
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [newClinicPassword, setNewClinicPassword] = useState('');
  const [newClinicOwnerEmail, setNewClinicOwnerEmail] = useState('');
  const [editClinicLogoUrl, setEditClinicLogoUrl] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.info('Logging out...');

    // Safety timeout: if signOut hangs, force redirect after 2s
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Attempt clean sign out
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Logout error (non-blocking):', error);
    } finally {
      // Force cleanup
      localStorage.clear();
      sessionStorage.clear();
      // Hard redirect to ensure clean state
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
        initialBalance: 0,
        compounderEmail: newClinicEmail,
        compounderPassword: newClinicPassword,
        logoUrl,
        ownerEmail: newClinicOwnerEmail || undefined // Pass owner email if provided
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
      setNewClinicOwnerEmail('');
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
      isLoggingOut={isLoggingOut}
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

      {activeTab === 'doctors' && (
        <DoctorsTab
          doctors={doctors}
          isLoading={isDoctorsLoading}
          onRefresh={fetchDoctors}
          onDelete={handleDeleteDoctor}
        />
      )}

      {activeTab === 'settings' && <SettingsTab />}





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

        ownerEmail={newClinicOwnerEmail}
        setOwnerEmail={setNewClinicOwnerEmail}
      />

      {/* Delete Clinic Alert */}
      <DeleteClinicAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* Delete Doctor Alert */}
      <Dialog open={isDeleteDoctorAlertOpen} onOpenChange={setIsDeleteDoctorAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor? This action cannot be undone.
              Linked clinics will NOT be deleted, but they will be unlinked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDoctorAlertOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteDoctor}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
}