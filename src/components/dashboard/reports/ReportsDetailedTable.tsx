import { CategoryStats } from '@/hooks/useReportStats';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ReportsDetailedTableProps {
    catStats: Record<string, CategoryStats>;
}

export function ReportsDetailedTable({ catStats }: ReportsDetailedTableProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="outline"
                    className="border-teal-200 text-teal-700"
                >
                    {showDetails ? 'Hide Detailed Breakdown' : 'Show Detailed Report (Categories)'}
                </Button>
            </div>

            {showDetails && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                        Patient Category Breakdown
                    </h3>
                    <div className="border rounded-lg overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-indigo-50 text-indigo-900 font-medium border-b border-indigo-100">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">Doctor Name</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Total Served</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap text-red-600">🚨 Emergency</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap text-blue-600">📄 Reports</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap text-teal-600">🩺 Checkups</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {Object.entries(catStats).map(([docName, stats]) => (
                                    <tr key={docName} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{docName}</td>
                                        <td className="px-4 py-3 text-center font-bold">{stats.total}</td>
                                        <td className="px-4 py-3 text-center bg-red-50/50 text-red-700 font-medium border-l border-r border-slate-100">{stats.emergency}</td>
                                        <td className="px-4 py-3 text-center bg-blue-50/50 text-blue-700 font-medium border-r border-slate-100">{stats.report}</td>
                                        <td className="px-4 py-3 text-center bg-teal-50/50 text-teal-700 font-medium">{stats.checkup}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
