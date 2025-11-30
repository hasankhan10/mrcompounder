import React, { FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';

interface RecentDoctor {
    name: string;
    imageUrl: string | null;
}

interface StartSessionCardProps {
    doctorName: string;
    setDoctorName: (name: string) => void;
    doctorImage: File | null;
    setDoctorImage: (file: File | null) => void;
    isLoading: boolean;
    onSubmit: (e: FormEvent) => void;
    recentDoctors?: RecentDoctor[];
    onSelectRecent?: (doctor: RecentDoctor) => void;
}

export function StartSessionCard({ doctorName, setDoctorName, doctorImage, setDoctorImage, isLoading, onSubmit, recentDoctors = [], onSelectRecent }: StartSessionCardProps) {
    return (
        <div className="max-w-md mx-auto mt-12">
            <Card className="border-none shadow-xl bg-white">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create Doctor Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentDoctors.length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Select</p>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {recentDoctors.map((doc, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => onSelectRecent?.(doc)}
                                        className="flex flex-col items-center min-w-[72px] group"
                                    >
                                        <div className="w-14 h-14 rounded-full border-2 border-gray-100 group-hover:border-blue-500 transition-colors overflow-hidden mb-1">
                                            {doc.imageUrl ? (
                                                <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                                                    {doc.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-600 truncate w-full text-center group-hover:text-blue-600">{doc.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Doctor's Image</label>
                            <FileUpload
                                value={doctorImage}
                                onChange={setDoctorImage}
                                accept="image/*"
                                label="Upload doctor photo"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="doctorName" className="text-sm font-medium text-gray-700">Doctor's Name</label>
                            <Input
                                id="doctorName"
                                placeholder="e.g. Dr. Smith"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                required
                                className="text-lg bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Open Booking'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
