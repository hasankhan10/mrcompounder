import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ReportsFilterProps {
    reportType: 'daily' | 'weekly' | 'monthly';
    setReportType: (type: 'daily' | 'weekly' | 'monthly') => void;
    dateValue: string;
    setDateValue: (date: string) => void;
    handleGenerateReport: () => void;
    isGenerating: boolean;
}

export function ReportsFilter({
    reportType,
    setReportType,
    dateValue,
    setDateValue,
    handleGenerateReport,
    isGenerating
}: ReportsFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <Select
                    value={reportType}
                    onValueChange={(val: 'daily' | 'weekly' | 'monthly') => {
                        setReportType(val);
                        // Reset date value based on type to avoid invalid formats
                        if (val === 'daily') setDateValue(new Date().toISOString().slice(0, 10));
                        else if (val === 'monthly') setDateValue(new Date().toISOString().slice(0, 7));
                        else if (val === 'weekly') {
                            const today = new Date();
                            const weekNum = Math.ceil((today.getDate() + 6 - today.getDay()) / 7);
                            setDateValue(`${today.getFullYear()}-W${weekNum}`); // Rough default week
                        }
                    }}
                >
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {reportType === 'daily' ? 'Select Date' : reportType === 'weekly' ? 'Select Week' : 'Select Month'}
                </label>
                <input
                    type={reportType === 'daily' ? 'date' : reportType === 'weekly' ? 'week' : 'month'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
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
    );
}
