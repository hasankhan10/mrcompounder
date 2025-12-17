import { api } from '@/lib/api-client';
import { CreateClinicRequest, UpdateClinicRequest, CreateClinicResponse, AdminStats, Clinic } from '@/lib/types';

export const adminService = {
    async fetchStats() {
        return api.get<AdminStats>('/api/admin/stats');
    },

    async fetchClinicStatsMap() {
        return api.get<Record<string, unknown>>('/api/admin/clinics/stats-map');
    },

    async createClinic(data: CreateClinicRequest) {
        return api.post<CreateClinicResponse>('/api/admin/clinics', data);
    },

    async updateClinic(id: string, data: UpdateClinicRequest) {
        return api.patch<Clinic>(`/api/admin/clinics/${id}`, data);
    },

    async deleteClinic(id: string) {
        return api.delete<{ message: string }>(`/api/admin/clinics/${id}`);
    },

    async toggleStatus(id: string, isActive: boolean) {
        return this.updateClinic(id, { isActive });
    },

    async topupClinic(id: string, amount: number) {
        return this.updateClinic(id, { topupAmount: amount });
    },

    async toggleTrial(id: string, startDate: string | null, endDate: string | null) {
        const updateData: Partial<UpdateClinicRequest> = {
            trialStartDate: startDate,
            trialEndDate: endDate
        };
        return this.updateClinic(id, updateData);
    },

    async createDoctor(data: { name: string; email: string; password: string; avatarUrl?: string }) {
        return api.post('/api/admin/doctors', data);
    },

    async fetchDoctors() {
        return api.get<{ doctors: import('@/lib/types').Doctor[] }>('/api/admin/doctors');
    },

    async deleteDoctor(id: string) {
        return api.delete<{ message: string }>(`/api/admin/doctors?id=${id}`);
    }
};

