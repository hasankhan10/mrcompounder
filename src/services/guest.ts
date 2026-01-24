import { api } from '@/lib/api-client';
import { Queue, Token } from '@/lib/types';

export const guestService = {
    async fetchQueue(token: string) {
        return api.get<{ queue: Queue; tokens: Token[] }>(`/api/guest/queue?token=${token}`);
    },

    async callNext(queueId: string, shareToken: string, currentCalledTokenId?: string, targetTokenId?: string) {
        return api.post<{ servedToken?: Token; calledToken?: Token; message?: string }>('/api/dashboard/token/call-next', {
            queueId,
            shareToken,
            currentCalledTokenId,
            targetTokenId
        });
    },

    async markAbsent(queueId: string, shareToken: string, currentCalledTokenId: string) {
        return api.post<{ message: string; token: Token }>('/api/dashboard/token/absent', {
            queueId,
            shareToken,
            currentCalledTokenId
        });
    },

    async deleteToken(tokenId: string, shareToken: string) {
        return api.delete(`/api/dashboard/token/${tokenId}?token=${shareToken}`);
    },

    async toggleBreak(sessionId: string, shareToken: string, newStatus: 'active' | 'paused') {
        return api.post<Queue>('/api/dashboard/session/toggle-break', {
            sessionId,
            shareToken,
            newStatus
        });
    },

    async endSession(sessionId: string, shareToken: string) {
        return api.post<{ message: string; endedAt: string }>('/api/dashboard/session/end', {
            sessionId,
            shareToken
        });
    }
};
