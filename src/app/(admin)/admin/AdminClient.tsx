'use client';

import { APP_NAME } from '@/lib/config';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic, PaymentRequest } from '@/lib/types';
import { toast } from 'sonner';
import { LayoutDashboard, Building2, Settings, QrCode, IndianRupee } from 'lucide-react';
import Image from 'next/image';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';

import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { ClinicListHeader } from '@/components/admin/ClinicListHeader';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { CreateClinicDialog } from '@/components/admin/CreateClinicDialog';
import { EditClinicDialog } from '@/components/admin/EditClinicDialog';
import { DeleteClinicAlert } from '@/components/admin/DeleteClinicAlert';
import { StatsGridSkeleton, PaymentRequestsSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { FileUpload } from '@/components/ui/file-upload';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { adminService } from '@/services/admin';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

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
  const [topupAmounts, setTopupAmounts] = useState<{ [key: string]: string }>({});
  const [trialDates, setTrialDates] = useState<{ [key: string]: { start: string, end: string } }>({});
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalPatientsToday: 0,
    totalRevenue: 0,
    lastMonthRevenue: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // UPI Settings State
  const [upiSettings, setUpiSettings] = useState({ upi_id: '', qr_code_url: '' });
  const [qrFile, setQrFile] = useState<File | null>(null);
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
          upi_id: data.upi_id || '',
          qr_code_url: data.qr_code_url || ''
        }))
        .catch(err => {
          console.error(err);
          toast.error('Failed to load settings', {
            description: 'Could not fetch UPI settings.'
          });
        });
    }
  }, [activeTab]);

  // ... (Realtime blocks will be removed next)

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      let url = upiSettings.qr_code_url;

      if (qrFile) {
        const fileName = `qr-${Date.now()}.png`;
        const { error } = await supabase.storage.from('clinic-logos').upload(fileName, qrFile);
        if (error) throw error;
        const { data } = supabase.storage.from('clinic-logos').getPublicUrl(fileName);
        url = data.publicUrl;
      }

      await adminService.saveSettings({ ...upiSettings, qr_code_url: url });

      setUpiSettings(prev => ({ ...prev, qr_code_url: url }));
      setQrFile(null);
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
  const [newClinicLocation, setNewClinicLocation] = useState(''); // Added location state
  const [newClinicLogo, setNewClinicLogo] = useState<File | null>(null);
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [newClinicPassword, setNewClinicPassword] = useState('');
  const [editClinicLogoUrl, setEditClinicLogoUrl] = useState(''); // For preview in edit
  const [formIsLoading, setFormIsLoading] = useState(false);

  const handleLogout = async () => {
    toast.info('Logging out...');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/login');
      router.refresh();
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
        location: newClinicLocation, // Pass location
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
      setNewClinicLocation(''); // Reset location
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
    setNewClinicLocation(clinic.location || ''); // Set location
    setEditClinicLogoUrl(clinic.logo_url || '');
    setNewClinicPassword(''); // Don't show existing password
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
        location: newClinicLocation, // Pass location
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

  const handleTopup = async (id: string) => {
    const amount = parseInt(topupAmounts[id] || '0');
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const updatedClinic = await adminService.topupClinic(id, amount);
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      setTopupAmounts(prev => ({ ...prev, [id]: '' }));
      toast.success(`Payment of ₹${amount} recorded`);

      // Optimistic update
      setStats(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + amount,

      }));

      // Refresh stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) setStats(await statsRes.json());

    } catch (err: unknown) {
      toast.error('Failed to record payment', {
        description: err instanceof Error ? err.message : 'Could not topup balance.'
      });
    }
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
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 14);
        start = today.toISOString().split('T')[0];
        end = nextWeek.toISOString().split('T')[0];

        setTrialDates(prev => ({
          ...prev,
          [id]: { start, end }
        }));
      }

      try {
        const updatedClinic = await adminService.toggleTrial(id, start, end);
        setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
        toast.success('Trial mode enabled');
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
              <AdminStatsGrid
                totalClinics={stats.totalClinics}
                totalPatientsToday={stats.totalPatientsToday}
                totalRevenue={stats.totalRevenue}
                lastMonthRevenue={stats.lastMonthRevenue}
              />
            )}
          </ErrorBoundary>
        </div>
      )}

      {activeTab === 'clinics' && (
        <div className="space-y-8 animate-fade-in-up">
          <ClinicListHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNewClinicClick={() => setIsCreateModalOpen(true)}
          />
          <ErrorBoundary name="Clinic Table">
            <ClinicTable
              clinics={filteredClinics}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              onTopup={handleTopup}
              topupAmounts={topupAmounts}
              setTopupAmounts={setTopupAmounts}
              onToggleTrial={handleToggleTrial}
              trialDates={trialDates}
              onTrialDateChange={handleTrialDateChange}
            />
          </ErrorBoundary>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex items-center justify-center h-full text-gray-500">
          Global Settings coming soon...
        </div>
      )}

      {activeTab === 'payment-requests' && (
        <div className="space-y-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold">Pending Bill Payments</h2>
          {isLoadingPayments ? (
            <PaymentRequestsSkeleton />
          ) : paymentRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests.</p>
          ) : (
            <ErrorBoundary name="Bill Payments">
              <div className="grid gap-4">
                {paymentRequests.map(req => (
                  <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{req.clinics?.name}</h3>
                      <p className="text-sm text-gray-500">Requested: {new Date(req.created_at).toLocaleString()}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-bold">₹{req.amount}</span>
                        {req.transaction_id && <span className="text-sm text-slate-600 font-mono">Txn: {req.transaction_id}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 border rounded overflow-hidden bg-slate-100 hover:opacity-80 transition relative">
                        <Image src={req.screenshot_url} alt="Proof" fill className="object-cover" />
                      </a>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleRequestAction(req.id, 'approve', req.amount)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, 'reject')}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ErrorBoundary>
          )}
        </div>
      )}

      {activeTab === 'upi-settings' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">UPI Payment Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiSettings.upi_id}
                onChange={e => setUpiSettings({ ...upiSettings, upi_id: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g. admin@upi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">QR Code Image</label>
              {upiSettings.qr_code_url && (
                <div className="mb-2 relative w-48 h-48 border rounded">
                  <Image src={upiSettings.qr_code_url} alt="QR Code" fill className="object-contain" />
                </div>
              )}
              <FileUpload
                value={qrFile}
                onChange={setQrFile}
                accept="image/*"
                label="Upload QR Code"
              />
              <p className="text-xs text-slate-500 mt-1">Upload a clear image of your QR code.</p>
            </div>
            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
            >
              {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
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
        location={newClinicLocation} // Pass location
        setLocation={setNewClinicLocation} // Pass setLocation
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
        location={newClinicLocation} // Pass location
        setLocation={setNewClinicLocation} // Pass setLocation
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