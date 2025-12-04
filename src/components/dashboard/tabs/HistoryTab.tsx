import { Queue } from '@/lib/types';
import Image from 'next/image';
import { HistorySkeleton } from '@/components/skeletons/DashboardSkeletons';

interface HistoryTabProps {
    pastSessions: Queue[];
    isLoading: boolean;
}

export function HistoryTab({ pastSessions, isLoading }: HistoryTabProps) {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Session History</h1>
                <p className="text-slate-500 mt-1">View records of past clinic sessions.</p>
            </div>

            {isLoading ? (
                <HistorySkeleton />
            ) : pastSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No past sessions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastSessions.map((session) => (
                        <div key={session.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow max-w-sm">
                            {session.doctor_image_url ? (
                                <Image src={session.doctor_image_url} alt={session.doctor_name || 'Doctor'} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 font-bold text-xl">
                                    {session.doctor_name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{session.doctor_name}</h3>
                                <p className="text-sm text-slate-500 mb-1">{new Date(session.created_at).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2">
                                    {session.status === 'cancelled' ? (
                                        <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                            Cancelled
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                                            Ended
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500 font-medium">
                                        {session.served_count || 0} Patients Served
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
