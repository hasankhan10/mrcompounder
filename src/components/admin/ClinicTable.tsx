import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { Clinic } from '@/lib/types';
import Image from 'next/image';

interface ClinicTableProps {
    clinics: Clinic[];
    onEdit: (clinic: Clinic) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onToggleTrial: (id: string, isActive: boolean) => void;
    trialDates: { [key: string]: { start: string, end: string } };
    onTrialDateChange: (id: string, type: 'start' | 'end', value: string) => void;
    onTopup: (id: string) => void;
    topupAmounts: { [key: string]: string };
    setTopupAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export function ClinicTable({
    clinics,
    onEdit,
    onDelete,
    onToggleStatus,
    onToggleTrial,
    trialDates,
    onTrialDateChange,
    onTopup,
    topupAmounts,
    setTopupAmounts
}: ClinicTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="w-[250px]">Clinic Details</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Served Today</TableHead>
                        <TableHead>Current Bill</TableHead>
                        <TableHead>Trial Period</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clinics.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                No clinics found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clinics.map((clinic) => (
                            <TableRow key={clinic.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        {clinic.logo_url ? (
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                                                <Image src={clinic.logo_url} alt={clinic.name || 'Clinic'} fill className="object-cover" unoptimized />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {(clinic.name || '?').charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{clinic.name || 'Unnamed Clinic'}</div>
                                            <div className="text-xs text-gray-500">/{clinic.slug}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-600">
                                        {clinic.location || '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={clinic.is_active}
                                            onCheckedChange={() => onToggleStatus(clinic.id, clinic.is_active)}
                                            className="data-[state=checked]:bg-green-500"
                                        />
                                        <span className={`text-sm ${clinic.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                            {clinic.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900 pl-4">
                                        {clinic.served_today_count || 0}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-red-600">₹{clinic.current_due}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={!!(clinic.trial_start_date && clinic.trial_end_date)}
                                                onCheckedChange={(checked) => onToggleTrial(clinic.id, checked)}
                                                className="data-[state=checked]:bg-purple-500"
                                            />
                                            <span className="text-xs text-gray-500">Trial Mode</span>
                                        </div>
                                        {!!(clinic.trial_start_date && clinic.trial_end_date) && (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="date"
                                                    className="text-xs border rounded px-1 py-0.5"
                                                    value={trialDates[clinic.id]?.start || clinic.trial_start_date?.split('T')[0] || ''}
                                                    onChange={(e) => onTrialDateChange(clinic.id, 'start', e.target.value)}
                                                />
                                                <input
                                                    type="date"
                                                    className="text-xs border rounded px-1 py-0.5"
                                                    value={trialDates[clinic.id]?.end || clinic.trial_end_date?.split('T')[0] || ''}
                                                    onChange={(e) => onTrialDateChange(clinic.id, 'end', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer" onClick={() => onEdit(clinic)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => onDelete(clinic.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow >
                        ))
                    )
                    }
                </TableBody >
            </Table >
        </div >
    );
}
