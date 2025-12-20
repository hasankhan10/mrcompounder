import { ReportItem } from '@/lib/types';
import { toast } from 'sonner';

export const exportReportsToExcel = async (
    reportData: ReportItem[],
    reportType: string,
    dateValue: string
) => {
    if (!reportData || reportData.length === 0) {
        toast.error('No data to download');
        return;
    }

    try {
        const XLSX = await import('xlsx');

        // 1. Prepare Summary Data (Doctor-wise)
        const doctorStats: Record<string, { booked: number; present: number; absent: number }> = {};

        reportData.forEach((token) => {
            const doctorName = token.queues?.doctor_name || 'Unknown';
            if (!doctorStats[doctorName]) {
                doctorStats[doctorName] = { booked: 0, present: 0, absent: 0 };
            }

            doctorStats[doctorName].booked++;

            if (token.status === 'served') {
                doctorStats[doctorName].present++;
            } else if (token.status === 'no_show') {
                doctorStats[doctorName].absent++;
            }
        });

        const summarySheetData = Object.entries(doctorStats).map(([docName, stats]) => ({
            'Doctor Name': docName,
            'Total Booked': stats.booked,
            'Present (Served)': stats.present,
            'Absent (No Show)': stats.absent,
            'Attendance Rate': stats.booked > 0 ? `${((stats.present / stats.booked) * 100).toFixed(1)}%` : '0%'
        }));

        // 2. Prepare Detailed Log Data
        const logSheetData = reportData.map((token) => ({
            'Date': new Date(token.created_at).toLocaleDateString(),
            'Time': new Date(token.created_at).toLocaleTimeString(),
            'Doctor Name': token.queues?.doctor_name || 'Unknown',
            'Patient Name': token.patient_name || 'N/A',
            'Phone': token.phone,
            'Token Number': token.token_number,
            'Status': token.status.toUpperCase(),
            'Category': token.is_emergency ? 'Emergency' : token.purpose?.toLowerCase().includes('report') ? 'Report' : 'Checkup'
        }));

        // 3. Create Workbook
        const wb = XLSX.utils.book_new();

        const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Doctor Performance");

        const logWs = XLSX.utils.json_to_sheet(logSheetData);
        XLSX.utils.book_append_sheet(wb, logWs, "Detailed Logs");

        // 4. Download
        XLSX.writeFile(wb, `Clinic_Report_${reportType}_${dateValue}.xlsx`);
        toast.success('Excel file downloaded');
    } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to generate Excel file');
    }
};
