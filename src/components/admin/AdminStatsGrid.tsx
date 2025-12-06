import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, IndianRupee, TrendingUp } from 'lucide-react';

interface AdminStatsGridProps {
    totalClinics: number;
    totalPatientsToday: number;
    totalRevenue: number;
    lastMonthRevenue: number;
}

export function AdminStatsGrid({ totalClinics, totalPatientsToday, totalRevenue, lastMonthRevenue }: AdminStatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-white hover-lift">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Total Clinics</p>
                            <h3 className="text-4xl font-bold text-slate-900">{totalClinics}</h3>
                        </div>
                        <div className="bg-white border border-slate-100 p-3 rounded-xl">
                            <Building2 className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-teal-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Active Across All Regions</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white hover-lift" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Patients Served Today</p>
                            <h3 className="text-4xl font-bold text-slate-900">{totalPatientsToday}</h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white hover-lift" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Total Revenue</p>
                            <h3 className="text-4xl font-bold text-slate-900">₹{totalRevenue}</h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <IndianRupee className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-slate-400 text-sm">
                        Based on ₹1/patient model
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white hover-lift" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Last Month Revenue</p>
                            <h3 className="text-4xl font-bold text-slate-900">₹{lastMonthRevenue}</h3>
                        </div>
                        <div className="bg-teal-100 p-3 rounded-xl">
                            <IndianRupee className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-slate-400 text-sm">
                        Previous month total
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
