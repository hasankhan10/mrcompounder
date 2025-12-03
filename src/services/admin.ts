import { CreateClinicRequest, UpdateClinicRequest } from '@/lib/types';

export const adminService = {
    async fetchPaymentRequests() {
        const res = await fetch('/api/admin/recharge/requests');
        if (!res.ok) throw new Error('Failed to fetch payment requests');
        return res.json();
    },

    async approvePaymentRequest(requestId: string, action: 'approve' | 'reject') {
        const res = await fetch('/api/admin/recharge/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, action })
        });
        if (!res.ok) throw new Error('Action failed');
        return res.json();
    },

    async fetchSettings() {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    async saveSettings(settings: { upi_id: string; qr_code_url: string }) {
        const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error('Failed to save settings');
        return res.json();
    },

    async fetchStats() {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async fetchClinicStatsMap() {
        const res = await fetch('/api/admin/clinics/stats-map');
        if (!res.ok) throw new Error('Failed to fetch clinic stats');
        return res.json();
    },

    async createClinic(data: CreateClinicRequest) {
        const res = await fetch('/api/admin/clinics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create clinic');
        }
        return res.json();
    },

    async updateClinic(id: string, data: UpdateClinicRequest) {
        const res = await fetch(`/api/admin/clinics/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update clinic');
        }
        return res.json();
    },

    async deleteClinic(id: string) {
        const res = await fetch(`/api/admin/clinics/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete clinic');
        return res.json();
    },

    async toggleStatus(id: string, isActive: boolean) {
        return this.updateClinic(id, { isActive });
    },

    async topupClinic(id: string, amount: number) {
        return this.updateClinic(id, { topupAmount: amount });
    },

    async toggleTrial(id: string, startDate: string | null, endDate: string | null) {
        // Explicitly pass null if the value is null, otherwise pass the string
        // We cast to any because the type definition might be strict about undefined vs null
        return this.updateClinic(id, {
            trialStartDate: startDate === null ? null : startDate,
            trialEndDate: endDate === null ? null : endDate
        } as any);
    }
};
