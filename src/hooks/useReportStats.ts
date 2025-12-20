import { useMemo } from 'react';
import { ReportItem } from '@/lib/types';

export interface DoctorStats {
    booked: number;
    present: number;
    absent: number;
    attendanceRate: string;
}

export interface CategoryStats {
    total: number;
    emergency: number;
    report: number;
    checkup: number;
}

export function useReportStats(reportData: ReportItem[] | null) {
    const stats = useMemo(() => {
        if (!reportData) return { doctorStats: {}, catStats: {} };

        const doctorStats: Record<string, DoctorStats> = {};
        const catStats: Record<string, CategoryStats> = {};

        reportData.forEach((token) => {
            const doctorName = token.queues?.doctor_name || 'Unknown';

            // Initialize stats if not present
            if (!doctorStats[doctorName]) {
                doctorStats[doctorName] = { booked: 0, present: 0, absent: 0, attendanceRate: '0%' };
            }
            if (!catStats[doctorName]) {
                catStats[doctorName] = { total: 0, emergency: 0, report: 0, checkup: 0 };
            }

            // Doctor Stats Logic
            doctorStats[doctorName].booked++;
            if (token.status === 'served') {
                doctorStats[doctorName].present++;
            } else if (token.status === 'no_show') {
                doctorStats[doctorName].absent++;
            }

            // Category Stats Logic
            if (token.status === 'served') {
                catStats[doctorName].total++;
                if (token.is_emergency) {
                    catStats[doctorName].emergency++;
                } else if (token.purpose?.toLowerCase().includes('report')) {
                    catStats[doctorName].report++;
                } else {
                    catStats[doctorName].checkup++;
                }
            }
        });

        // Calculate attendance rates
        Object.keys(doctorStats).forEach(doc => {
            const s = doctorStats[doc];
            s.attendanceRate = s.booked > 0 ? `${((s.present / s.booked) * 100).toFixed(1)}%` : '0%';
        });

        return { doctorStats, catStats };
    }, [reportData]);

    return stats;
}
