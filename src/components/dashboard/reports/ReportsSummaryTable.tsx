import { DoctorStats } from '@/hooks/useReportStats';

interface ReportsSummaryTableProps {
    doctorStats: Record<string, DoctorStats>;
}

export function ReportsSummaryTable({ doctorStats }: ReportsSummaryTableProps) {
    return (
        <div className="border rounded-lg overflow-hidden overflow-x-auto max-w-[80vw] md:max-w-full mx-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                    <tr>
                        <th className="px-4 py-3 whitespace-nowrap">Doctor Name</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Total Booked</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Present</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Absent</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap">Attendance Rate</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {Object.entries(doctorStats).map(([docName, stats]) => (
                        <tr key={docName} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{docName}</td>
                            <td className="px-4 py-3 text-center">{stats.booked}</td>
                            <td className="px-4 py-3 text-center text-green-600">{stats.present}</td>
                            <td className="px-4 py-3 text-center text-red-600">{stats.absent}</td>
                            <td className="px-4 py-3 text-right font-bold">
                                {stats.attendanceRate}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
