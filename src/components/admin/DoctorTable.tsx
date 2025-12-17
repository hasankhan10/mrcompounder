
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Calendar, MapPin, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Doctor } from '@/lib/types';

interface DoctorTableProps {
    doctors: Doctor[];
    onDelete: (id: string, name: string) => void;
}

export function DoctorTable({ doctors, onDelete }: DoctorTableProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Email copied to clipboard');
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50">
                        <TableHead className="w-[300px]">Doctor Details</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Clinics Linked</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doctors.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="p-3 bg-slate-100 rounded-full">
                                        <Mail className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p>No doctors found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        doctors.map((doctor) => (
                            <TableRow key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage src={doctor.avatar_url} alt={doctor.full_name || 'Doctor'} />
                                            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                                                {(doctor.full_name || '?').charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-slate-900">{doctor.full_name || 'Unnamed'}</div>
                                            <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                                                ID: {doctor.id.slice(0, 8)}...
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => doctor.email && copyToClipboard(doctor.email)}>
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-sm text-slate-600 font-mono">{doctor.email || 'No Email'}</span>
                                        <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={doctor.clinic_count ? "bg-teal-50 text-teal-700 hover:bg-teal-100" : "bg-slate-100 text-slate-500"}>
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {doctor.clinic_count || 0} Locations
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => onDelete(doctor.id, doctor.full_name || 'Doctor')}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
