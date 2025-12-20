import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services/dashboard';
import { toast } from 'sonner';
import { Calendar, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ReportItem } from '@/lib/types';
import { useReportStats } from '@/hooks/useReportStats';
import { exportReportsToExcel } from '@/utils/exportReports';

import { ReportsFilter } from '@/components/dashboard/reports/ReportsFilter';
import { ReportsSummaryTable } from '@/components/dashboard/reports/ReportsSummaryTable';
import { ReportsDetailedTable } from '@/components/dashboard/reports/ReportsDetailedTable';
import { RevenueCalculator } from '@/components/dashboard/reports/RevenueCalculator';

export function ReportsTab() {
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [dateValue, setDateValue] = useState<string>(new Date().toISOString().slice(0, 7)); // Default to current month
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<ReportItem[] | null>(null);

    const { doctorStats, catStats } = useReportStats(reportData);

    const handleGenerateReport = async () => {
        if (!dateValue) {
            toast.error('Please select a date');
            return;
        }
        setIsGenerating(true);
        try {
            const data = await dashboardService.fetchReport(reportType, dateValue);
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
        if (reportData) {
            await exportReportsToExcel(reportData, reportType, dateValue);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-1">Generate and download performance reports.</p>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        Generate Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ReportsFilter
                        reportType={reportType}
                        setReportType={setReportType}
                        dateValue={dateValue}
                        setDateValue={setDateValue}
                        handleGenerateReport={handleGenerateReport}
                        isGenerating={isGenerating}
                    />

                    {reportData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Preview Table */}
                            <ReportsSummaryTable doctorStats={doctorStats} />

                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-green-900">Report Ready!</h3>
                                    <p className="text-green-700">
                                        Found <span className="font-bold">{reportData.length}</span> records for {dateValue}.
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

                            {/* Category Breakdown */}
                            <ReportsDetailedTable catStats={catStats} />

                            {/* Revenue Calculator */}
                            <RevenueCalculator reportData={reportData} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

