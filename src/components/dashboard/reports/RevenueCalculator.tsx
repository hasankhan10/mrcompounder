import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { ReportItem } from '@/lib/types';

interface RevenueCalculatorProps {
    reportData: ReportItem[] | null;
}

export function RevenueCalculator({ reportData }: RevenueCalculatorProps) {
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [doctorFee, setDoctorFee] = useState<string>('');
    const [clinicCommission, setClinicCommission] = useState<string>('');
    const [result, setResult] = useState<{ served: number; total: number; doctorShare: number; clinicShare: number; hasCommission: boolean } | null>(null);

    // Extract unique doctors
    const doctors = reportData ? Array.from(new Set(reportData.map(r => r.queues?.doctor_name || 'Unknown'))) as string[] : [];

    const handleCalculate = () => {
        if (!selectedDoctor || !doctorFee) {
            toast.error('Please fill Doctor and Fees');
            return;
        }
        if (!reportData) return;

        const fee = parseFloat(doctorFee);
        const commission = clinicCommission ? parseFloat(clinicCommission) : 0;

        if (isNaN(fee) || (clinicCommission && isNaN(commission))) {
            toast.error('Invalid numeric values');
            return;
        }

        // Count served patients for selected doctor
        const servedCount = reportData.filter(
            r => (r.queues?.doctor_name || 'Unknown') === selectedDoctor && r.status === 'served'
        ).length;

        const totalCollection = servedCount * fee;
        const clinicShare = servedCount * commission;
        const doctorShare = totalCollection - clinicShare;

        setResult({
            served: servedCount,
            total: totalCollection,
            doctorShare,
            clinicShare,
            hasCommission: clinicCommission !== ''
        });
    };

    if (!reportData) return null;

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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Commission (₹) <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-slate-900"
                            placeholder="0"
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
                            <p className="text-sm text-indigo-700 font-medium">Doctor&apos;s Earning</p>
                            <p className="text-2xl font-bold text-indigo-900 mt-1">₹{result.doctorShare.toLocaleString()}</p>
                        </div>
                        {result.hasCommission && (
                            <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 shadow-sm">
                                <p className="text-sm text-teal-700 font-medium">Clinic Revenue</p>
                                <p className="text-2xl font-bold text-teal-900 mt-1">₹{result.clinicShare.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
