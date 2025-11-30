'use client';

import { APP_NAME } from '@/lib/config';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Clinic } from '@/lib/types';
import { toast } from 'sonner';
import { LayoutDashboard, Building2, Settings, QrCode, IndianRupee } from 'lucide-react';

// Components
import { DashboardShell, NavItem } from '@/components/shared/DashboardShell';
import { PageLoading } from '@/components/shared/PageLoading';
import { PageError } from '@/components/shared/PageError';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { ClinicListHeader } from '@/components/admin/ClinicListHeader';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { CreateClinicDialog } from '@/components/admin/CreateClinicDialog';
import { EditClinicDialog } from '@/components/admin/EditClinicDialog';
import { DeleteClinicAlert } from '@/components/admin/DeleteClinicAlert';
import { FileUpload } from '@/components/ui/file-upload';

interface AdminClientProps {
  initialClinics: Clinic[];
}

export function AdminClient({ initialClinics }: AdminClientProps) {
  const supabase = createClient();
  const router = useRouter();

  // Page-level state
  const [pageIsLoading, setPageIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
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

  // UPI Settings State
  const [upiSettings, setUpiSettings] = useState({ upi_id: '', qr_code_url: '' });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

  // Fetch Payment Requests
  useEffect(() => {
    if (activeTab === 'payment-requests') {
      fetch('/api/admin/recharge/requests')
        .then(res => res.json())
        .then(data => setPaymentRequests(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/recharge/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      if (!res.ok) throw new Error('Action failed');

      toast.success(`Request ${action}d`);
      setPaymentRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      toast.error('Failed to process request');
    }
  };

  // Fetch UPI Settings
  useEffect(() => {
    if (activeTab === 'upi-settings') {
      fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => setUpiSettings({
          upi_id: data.upi_id || '',
          qr_code_url: data.qr_code_url || ''
        }))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  // Realtime Subscription for Clinics
  useEffect(() => {
    const channel = supabase
      .channel('admin-clinics-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clinics',
        },
        (payload) => {
          const updatedClinic = payload.new as Clinic;
          setClinics((prevClinics) =>
            prevClinics.map((clinic) =>
              clinic.id === updatedClinic.id ? { ...clinic, ...updatedClinic } : clinic
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...upiSettings, qr_code_url: url })
      });

      if (!res.ok) throw new Error('Failed to save');

      setUpiSettings(prev => ({ ...prev, qr_code_url: url }));
      setQrFile(null);
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const navItems: NavItem[] = [
    { label: 'Overview', value: 'overview', icon: LayoutDashboard },
    { label: 'Clinics', value: 'clinics', icon: Building2 },
    { label: 'Payment Requests', value: 'payment-requests', icon: IndianRupee },
    { label: 'UPI Settings', value: 'upi-settings', icon: QrCode },
    { label: 'Settings', value: 'settings', icon: Settings },
  ];

  // Fetch Stats Helper
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  // Fetch Clinic Stats Map (Served Today)
  const fetchClinicStats = async () => {
    try {
      const res = await fetch('/api/admin/clinics/stats-map');
      if (res.ok) {
        const counts = await res.json();
        setClinics(prev => prev.map(c => ({
          ...c,
          served_today_count: counts[c.id] || 0
        })));
      }
    } catch (error) {
      console.error('Failed to fetch clinic stats', error);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Real-time Subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinics' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClinics((prev) => [...prev, payload.new as Clinic]);
            fetchStats();
          } else if (payload.eventType === 'UPDATE') {
            setClinics((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Clinic) : c)));
            fetchStats();
          } else if (payload.eventType === 'DELETE') {
            setClinics((prev) => prev.filter((c) => c.id !== payload.old.id));
            fetchStats();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tokens' },
        () => {
          fetchStats(); // Update patient count
          fetchClinicStats(); // Update per-clinic served count
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        () => {
          fetchStats(); // Update revenue
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Modal/Dialog state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Form state (Create/Edit)
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicSlug, setNewClinicSlug] = useState('');
  const [newClinicLogo, setNewClinicLogo] = useState<File | null>(null);
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [newClinicPassword, setNewClinicPassword] = useState('');
  const [editClinicLogoUrl, setEditClinicLogoUrl] = useState(''); // For preview in edit
  const [formIsLoading, setFormIsLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('clinic-logos')
          .upload(fileName, newClinicLogo);

        if (uploadError) throw new Error('Logo upload failed');

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // 2. Create Clinic
      const response = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClinicName,
          slug: newClinicSlug,
          logo_url: logoUrl,
          email: newClinicEmail,
          password: newClinicPassword
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create clinic');
      }

      const newClinic = await response.json();
      setClinics([...clinics, newClinic]);
      setIsCreateModalOpen(false);

      // Reset form
      setNewClinicName('');
      setNewClinicSlug('');
      setNewClinicLogo(null);
      setNewClinicEmail('');
      setNewClinicPassword('');
      toast.success('Clinic created successfully');

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleEditClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setNewClinicName(clinic.name);
    setNewClinicSlug(clinic.slug);
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

      const response = await fetch(`/api/admin/clinics/${selectedClinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClinicName,
          slug: newClinicSlug,
          logo_url: logoUrl,
          password: newClinicPassword || undefined // Only send if changed
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update clinic');
      }

      const updatedClinic = await response.json();
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      setIsEditModalOpen(false);
      toast.success('Clinic updated successfully');

    } catch (err: any) {
      toast.error(err.message);
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
      const response = await fetch(`/api/admin/clinics/${selectedClinic.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete clinic');

      setClinics(clinics.filter(c => c.id !== selectedClinic.id));
      setIsDeleteAlertOpen(false);
      toast.success('Clinic deleted successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/clinics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }), // Fixed key
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedClinic = await response.json();
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      toast.success(`Clinic ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTopup = async (id: string) => {
    const amount = parseInt(topupAmounts[id] || '0');
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`/api/admin/clinics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topupAmount: amount }),
      });

      if (!response.ok) throw new Error('Failed to top-up');

      const updatedClinic = await response.json();
      setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
      setTopupAmounts(prev => ({ ...prev, [id]: '' }));
      toast.success(`Added ₹${amount} to balance`);

      // Refresh stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) setStats(await statsRes.json());

    } catch (err: any) {
      toast.error(err.message);
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
        const response = await fetch(`/api/admin/clinics/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trialStartDate: null, trialEndDate: null }),
        });
        if (!response.ok) throw new Error('Failed to disable trial');
        const updatedClinic = await response.json();
        setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
        toast.success('Trial mode disabled');
      } catch (err: any) {
        toast.error(err.message);
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
        const response = await fetch(`/api/admin/clinics/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trialStartDate: start, trialEndDate: end }),
        });
        if (!response.ok) throw new Error('Failed to enable trial');
        const updatedClinic = await response.json();
        setClinics(clinics.map(c => c.id === updatedClinic.id ? updatedClinic : c));
        toast.success('Trial mode enabled');
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  // --- Derived Data ---
  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (pageIsLoading) return <PageLoading message="Loading Admin Dashboard..." />;
  if (pageError) return <PageError message={pageError} />;


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
            <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <AdminStatsGrid
            totalClinics={stats.totalClinics}
            totalPatientsToday={stats.totalPatientsToday}
            totalRevenue={stats.totalRevenue}
            lastMonthRevenue={stats.lastMonthRevenue}
          />
        </div>
      )}

      {activeTab === 'clinics' && (
        <div className="space-y-8 animate-fade-in-up">
          <ClinicListHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNewClinicClick={() => setIsCreateModalOpen(true)}
          />
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
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex items-center justify-center h-full text-gray-500">
          Global Settings coming soon...
        </div>
      )}

      {activeTab === 'payment-requests' && (
        <div className="space-y-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold">Pending Payment Requests</h2>
          {paymentRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests.</p>
          ) : (
            <div className="grid gap-4">
              {paymentRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{req.clinics?.name}</h3>
                    <p className="text-sm text-gray-500">Requested: {new Date(req.created_at).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">₹{req.amount}</span>
                      {req.transaction_id && <span className="text-sm text-gray-600 font-mono">Txn: {req.transaction_id}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 border rounded overflow-hidden bg-gray-100 hover:opacity-80 transition">
                      <img src={req.screenshot_url} alt="Proof" className="w-full h-full object-cover" />
                    </a>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRequestAction(req.id, 'approve')}
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
          )}
        </div>
      )}

      {activeTab === 'upi-settings' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6">UPI Payment Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiSettings.upi_id}
                onChange={e => setUpiSettings({ ...upiSettings, upi_id: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. admin@upi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
              {upiSettings.qr_code_url && (
                <div className="mb-2">
                  <img src={upiSettings.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain border rounded" />
                </div>
              )}
              <FileUpload
                value={qrFile}
                onChange={setQrFile}
                accept="image/*"
                label="Upload QR Code"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear image of your QR code.</p>
            </div>
            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
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
        logoUrl={editClinicLogoUrl}
        setLogoUrl={setEditClinicLogoUrl}
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