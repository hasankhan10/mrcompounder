import { api } from '@/lib/api-client';
import { Queue, Token } from '@/lib/types';

export const dashboardService = {
    async fetchHistory() {
        return api.get<Queue[]>('/api/dashboard/history');
    },

    async fetchRecentDoctors() {
        return api.get<{ doctor_name: string; doctor_image_url: string }[]>('/api/dashboard/doctors/recent');
    },

    async startSession(data: { doctorName: string; doctorImageUrl: string; doctorArrivalTime: string }) {
        return api.post<Queue>('/api/dashboard/session/start', data);
    },

    async toggleBreak(sessionId: string, newStatus: 'active' | 'paused') {
        return api.post<Queue>('/api/dashboard/session/toggle-break', { sessionId, newStatus });
    },

    async endSession(sessionId: string) {
        return api.post<{ message: string; endedAt: string }>('/api/dashboard/session/end', { sessionId });
    },

    async cancelSession(sessionId: string) {
        return api.post<{ message: string; cancelledAt: string }>('/api/dashboard/session/cancel', { sessionId });
    },

    async activateSession(sessionId: string) {
        return api.post<Queue>('/api/dashboard/session/activate', { sessionId });
    },

    async registerPatient(data: { queueId: string; phone: string; patientName: string; gender?: 'male' | 'female' | 'other'; age?: number; purpose: string; is_emergency?: boolean; locationId?: string }) {
        return api.post<Token>('/api/dashboard/token/register', data);
    },

    async callNext(queueId: string, currentCalledTokenId?: string, targetTokenId?: string) {
        return api.post<{ servedToken?: Token; calledToken?: Token; message?: string }>('/api/dashboard/token/call-next', {
            queueId,
            currentCalledTokenId,
            targetTokenId
        });
    },

    async deleteToken(tokenId: string) {
        return api.delete(`/api/dashboard/token/${tokenId}`);
    },

    async markAbsent(queueId: string, currentCalledTokenId: string) {
        return api.post<{ message: string; token: Token }>('/api/dashboard/token/absent', {
            queueId,
            currentCalledTokenId
        });
    },

    async fetchReport(type: 'daily' | 'weekly' | 'monthly', value: string) {
        return api.get<import('@/lib/types').ReportItem[]>(`/api/dashboard/reports?type=${type}&value=${value}`);
    },

    async updateSettings(data: { logoUrl: string }) {
        return api.post('/api/dashboard/settings', data);
    }
};

