import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { IndianRupee, Users, Building2, Calendar } from 'lucide-react';

interface ChartData {
    date: string;
    value: number;
}

interface AdminStatsChartsProps {
    totalClinics: number;
    totalPatientsToday: number;
    totalRevenue: number;
    lastMonthRevenue: number;
    patientsTrend?: ChartData[];
    revenueTrend?: ChartData[];
}

export function AdminStatsCharts({
    totalClinics,
    totalPatientsToday,
    totalRevenue,
    lastMonthRevenue,
    patientsTrend = [],
    revenueTrend = []
}: AdminStatsChartsProps) {

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Total Clinics */}
            <Card className="shadow-sm border-slate-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Clinics</CardTitle>
                    <Building2 className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{totalClinics}</div>
                    <p className="text-xs text-slate-500 mt-1">Active on platform</p>
                </CardContent>
            </Card>

            {/* 2. Last Month Revenue */}
            <Card className="shadow-sm border-slate-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Last Month Revenue</CardTitle>
                    <Calendar className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">₹{lastMonthRevenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">Previous billing cycle</p>
                </CardContent>
            </Card>

            {/* 3. Patients Trend (Spanning 2 columns on large screens if needed, or separate row) */}
            {/* Actually, let's put charts in their own section below the summary, 
                BUT the user said "replace the 4 components". 
                I will make the Patient and Revenue cards BIGGER and containing the charts. 
            */}

            {/* Patient Traffic Chart Card */}
            <Card className="col-span-1 md:col-span-2 shadow-md border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Users className="h-5 w-5 text-teal-600" />
                        Patient Traffic
                        <span className="ml-auto text-sm font-normal text-slate-500">Last 7 Days</span>
                    </CardTitle>
                    <div className="mt-1">
                        <span className="text-3xl font-bold text-slate-900">{totalPatientsToday}</span>
                        <span className="text-sm text-slate-500 ml-2">Patients Today</span>
                    </div>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={patientsTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue Trend Chart Card */}
            <Card className="col-span-1 md:col-span-2 shadow-md border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-indigo-600" />
                        Revenue Trend
                        <span className="ml-auto text-sm font-normal text-slate-500">Last 7 Days</span>
                    </CardTitle>
                    <div className="mt-1">
                        <span className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</span>
                        <span className="text-sm text-slate-500 ml-2">Total Revenue</span>
                    </div>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
