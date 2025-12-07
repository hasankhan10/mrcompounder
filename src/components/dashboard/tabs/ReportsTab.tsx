import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services/dashboard';
import { toast } from 'sonner';

import { FileDown, Loader2, Calendar, IndianRupee, Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



export function ReportsTab() {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<{ queues: { doctor_name: string }; status: string; created_at: string; patient_name: string; phone: string; token_number: number }[] | null>(null);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const data = await dashboardService.fetchMonthlyReport(selectedMonth);
            setReportData(data);
            toast.success('Report data fetched successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to download');
            return;
        }

        const XLSX = await import('xlsx');

        // 1. Prepare Summary Data (Doctor-wise)
        const doctorStats: Record<string, { booked: number; present: number; absent: number }> = {};

        reportData.forEach((token: { queues: { doctor_name: string }; status: string }) => {
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
            'Status': token.status.toUpperCase()
        }));

        // 3. Create Workbook
        const wb = XLSX.utils.book_new();

        const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Doctor Performance");

        const logWs = XLSX.utils.json_to_sheet(logSheetData);
        XLSX.utils.book_append_sheet(wb, logWs, "Detailed Logs");

        // 4. Download
        XLSX.writeFile(wb, `Clinic_Report_${selectedMonth}.xlsx`);
        toast.success('Excel file downloaded');
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Monthly Reports</h1>
                <p className="text-slate-500 mt-1">Generate and download detailed performance reports.</p>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        Select Month
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-64">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                            <input
                                type="month"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isGenerating ? 'Fetching Data...' : 'Get Report'}
                        </Button>
                    </div>

                    {reportData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Preview Table */}
                            <div className="border rounded-lg overflow-hidden overflow-x-auto">
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
                                        {(() => {
                                            const doctorStats: Record<string, { booked: number; present: number; absent: number }> = {};
                                            reportData.forEach((token) => {
                                                const doctorName = token.queues?.doctor_name || 'Unknown';
                                                if (!doctorStats[doctorName]) {
                                                    doctorStats[doctorName] = { booked: 0, present: 0, absent: 0 };
                                                }
                                                doctorStats[doctorName].booked++;
                                                if (token.status === 'served') doctorStats[doctorName].present++;
                                                else if (token.status === 'no_show') doctorStats[doctorName].absent++;
                                            });

                                            return Object.entries(doctorStats).map(([docName, stats]) => (
                                                <tr key={docName} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{docName}</td>
                                                    <td className="px-4 py-3 text-center">{stats.booked}</td>
                                                    <td className="px-4 py-3 text-center text-green-600">{stats.present}</td>
                                                    <td className="px-4 py-3 text-center text-red-600">{stats.absent}</td>
                                                    <td className="px-4 py-3 text-right font-bold">
                                                        {stats.booked > 0 ? `${((stats.present / stats.booked) * 100).toFixed(1)}%` : '0%'}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-green-900">Report Ready!</h3>
                                    <p className="text-green-700">
                                        Found <span className="font-bold">{reportData.length}</span> records for {selectedMonth}.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDownloadExcel}
                                    size="lg"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
                                >
                                    <FileDown className="w-5 h-5 mr-2" />
                                    Download Excel
                                </Button>
                            </div>

                            {/* Revenue Calculator */}
                            <RevenueCalculator reportData={reportData} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueCalculator({ reportData }: { reportData: any[] }) {
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [doctorFee, setDoctorFee] = useState<string>('');
    const [clinicCommission, setClinicCommission] = useState<string>('');
    const [result, setResult] = useState<{ served: number; total: number; doctorShare: number; clinicShare: number } | null>(null);

    // Extract unique doctors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctors = Array.from(new Set(reportData.map((r: any) => r.queues?.doctor_name || 'Unknown'))) as string[];

    const handleCalculate = () => {
        if (!selectedDoctor || !doctorFee || !clinicCommission) {
            toast.error('Please fill all fields');
            return;
        }

        const fee = parseFloat(doctorFee);
        const commission = parseFloat(clinicCommission);

        if (isNaN(fee) || isNaN(commission)) {
            toast.error('Invalid numeric values');
            return;
        }

        // Count served patients for selected doctor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const servedCount = reportData.filter(
            (r: any) => (r.queues?.doctor_name || 'Unknown') === selectedDoctor && r.status === 'served'
        ).length;

        const totalCollection = servedCount * fee;
        const clinicShare = servedCount * commission;
        const doctorShare = totalCollection - clinicShare;

        setResult({
            served: servedCount,
            total: totalCollection,
            doctorShare,
            clinicShare
        });
    };

    return (
        <Card className="border shadow-none bg-slate-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    Revenue Calculator
                </CardTitle>
                <p className="text-sm text-slate-500">Calculate doctor earnings and clinic commission.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
                        <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
                            <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                <SelectValue placeholder="Select Doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((doc) => (
                                    <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Fee (₹)</label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-slate-900"
                            placeholder="e.g. 500"
                            value={doctorFee}
                            onChange={e => setDoctorFee(e.target.value)}
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Commission (₹)</label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-slate-900"
                            placeholder="e.g. 100"
                            value={clinicCommission}
                            onChange={e => setClinicCommission(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCalculate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                        Calculate
                    </Button>
                </div>

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top-2">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <p className="text-sm text-slate-500 font-medium">Patients Served</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{result.served}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <p className="text-sm text-slate-500 font-medium">Total Collection</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">₹{result.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <p className="text-sm text-indigo-700 font-medium">Doctor's Earning</p>
                            <p className="text-2xl font-bold text-indigo-900 mt-1">₹{result.doctorShare.toLocaleString()}</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 shadow-sm">
                            <p className="text-sm text-teal-700 font-medium">Clinic Revenue</p>
                            <p className="text-2xl font-bold text-teal-900 mt-1">₹{result.clinicShare.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
