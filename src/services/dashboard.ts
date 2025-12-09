import { Queue, Token } from '@/lib/types';

export const dashboardService = {
    async fetchHistory() {
        const res = await fetch('/api/dashboard/history');
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json() as Promise<Queue[]>;
    },

    async fetchRecentDoctors() {
        const res = await fetch('/api/dashboard/doctors/recent');
        if (!res.ok) throw new Error('Failed to fetch recent doctors');
        return res.json() as Promise<{ doctor_name: string; doctor_image_url: string }[]>;
    },

    async startSession(data: { doctorName: string; doctorImageUrl: string; doctorArrivalTime: string }) {
        const response = await fetch('/api/dashboard/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to start session');
        }
        return response.json() as Promise<Queue>;
    },

    async toggleBreak(sessionId: string, newStatus: 'active' | 'paused') {
        const response = await fetch('/api/dashboard/session/toggle-break', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, newStatus }),
        });

        if (!response.ok) throw new Error('Failed to toggle break');
        return response.json() as Promise<Queue>;
    },

    async endSession(sessionId: string) {
        const response = await fetch('/api/dashboard/session/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) throw new Error('Failed to end session');
        return response.json();
    },

    async cancelSession(sessionId: string) {
        const response = await fetch('/api/dashboard/session/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) throw new Error('Failed to cancel session');
        return response.json();
    },

    async activateSession(sessionId: string) {
        const response = await fetch('/api/dashboard/session/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) throw new Error('Failed to activate session');
        return response.json() as Promise<Queue>;
    },

    async registerPatient(data: { queueId: string; phone: string; patientName: string; gender?: 'male' | 'female' | 'other'; age?: number; purpose: string }) {
        const response = await fetch('/api/dashboard/token/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to register token');
        }
        return response.json() as Promise<Token>;
    },

    async callNext(queueId: string, currentCalledTokenId?: string) {
        const response = await fetch('/api/dashboard/token/call-next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                queueId,
                currentCalledTokenId
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to call next token');
        }
        return response.json();
    },

    async deleteToken(tokenId: string) {
        const response = await fetch(`/api/dashboard/token/${tokenId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete token');

        // 204 No Content means success but no body
        if (response.status === 204) {
            return null;
        }

        return response.json();
    },

    async markAbsent(queueId: string, currentCalledTokenId: string) {
        const response = await fetch('/api/dashboard/token/absent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                queueId,
                currentCalledTokenId
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to mark absent');
        }
        return response.json();
    },

    async fetchMonthlyReport(month: string) {
        const res = await fetch(`/api/dashboard/reports?month=${month}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        return res.json();
    },

    async updateSettings(data: { logoUrl: string }) {
        const response = await fetch('/api/dashboard/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to update settings');
        }
        return response.json();
    }
};
