import React, { FormEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface RegisterPatientCardProps {
    doctorName?: string;
    doctorImageUrl?: string;
    patientName: string;
    setPatientName: (name: string) => void;
    patientPhone: string;
    setPatientPhone: (phone: string) => void;
    patientGender?: 'male' | 'female' | 'other';
    setPatientGender: (gender: 'male' | 'female' | 'other' | undefined) => void;
    patientAge: string;
    setPatientAge: (age: string) => void;
    patientPurpose: string;
    setPatientPurpose: (purpose: string) => void;
    isEmergency: boolean;
    setIsEmergency: (val: boolean) => void;
    isLoading: boolean;
    isSessionActive: boolean;
    onSubmit: (e: FormEvent) => void;
}

export function RegisterPatientCard({
    doctorName,
    doctorImageUrl,
    patientName,
    setPatientName,
    patientPhone,
    setPatientPhone,
    patientGender,
    setPatientGender,
    patientAge,
    setPatientAge,
    patientPurpose,
    setPatientPurpose,
    isEmergency,
    setIsEmergency,
    isLoading,
    isSessionActive,
    onSubmit
}: RegisterPatientCardProps) {
    return (
        <div className="max-w-md mx-auto mt-8">
            {/* Doctor Info Header */}
            <div className="flex flex-col items-center mb-6">
                {doctorImageUrl ? (
                    <div className="relative w-24 h-24 mb-3">
                        <Image
                            src={doctorImageUrl}
                            alt={doctorName || 'Doctor'}
                            fill
                            className="rounded-full object-cover border-4 border-white shadow-lg"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-3 shadow-inner">
                        <span className="text-2xl font-bold text-teal-600">{doctorName?.charAt(0)}</span>
                    </div>
                )}
                <h2 className="text-xl font-bold text-slate-900">Booking for {doctorName}</h2>
                <p className="text-sm text-slate-500">Session Active</p>
            </div>

            <Card className="border-none shadow-xl bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-center">Add Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Patient Name</label>
                            <Input
                                placeholder="Enter patient name"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="text-lg bg-slate-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <Input
                                type="tel"
                                placeholder="Enter phone number"
                                value={patientPhone}
                                onChange={(e) => setPatientPhone(e.target.value)}
                                required
                                className="text-lg bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Age</label>
                                <Input
                                    type="number"
                                    placeholder="Age"
                                    value={patientAge}
                                    onChange={(e) => setPatientAge(e.target.value)}
                                    className="text-lg bg-slate-50"
                                    min="0"
                                    max="120"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Gender</label>
                                <Select value={patientGender || ""} onValueChange={(val: 'male' | 'female' | 'other') => setPatientGender(val)}>
                                    <SelectTrigger className="text-lg bg-slate-50">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Purpose</label>
                            <Input
                                placeholder="e.g. Fever, Checkup"
                                value={patientPurpose}
                                onChange={(e) => setPatientPurpose(e.target.value)}
                                className="text-lg bg-slate-50"
                            />
                        </div>

                        <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-100">
                            <input
                                type="checkbox"
                                id="emergency"
                                checked={isEmergency}
                                onChange={(e) => setIsEmergency(e.target.checked)}
                                className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <label
                                htmlFor="emergency"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-700"
                            >
                                🚨 Emergency / Priority Case
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg py-6 shadow-md hover:shadow-lg transition-all"
                            disabled={isLoading || !isSessionActive}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Patient'
                            )}
                        </Button>
                        {!isSessionActive && <p className="text-xs text-center text-yellow-600">Resume session to register patients.</p>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
