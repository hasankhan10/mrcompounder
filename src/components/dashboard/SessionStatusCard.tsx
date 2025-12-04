import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SessionStatusCardProps {
    status: 'active' | 'paused';
    doctorName: string;
    onToggleBreak: () => void;
    onEndSession: () => void;
    loadingAction: string | null;
}

export function SessionStatusCard({ status, doctorName, onToggleBreak, onEndSession, loadingAction }: SessionStatusCardProps) {
    return (
        <Card className="border-none shadow-md bg-white overflow-hidden">
            <div className={`h-2 ${status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Session Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {status}
                    </span>
                </CardTitle>
                <p className="text-sm text-slate-500">Doctor: <span className="font-medium text-slate-900">{doctorName}</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    variant="outline"
                    className={`w-full ${status === 'active' ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                    onClick={onToggleBreak}
                    disabled={!!loadingAction}
                >
                    {loadingAction === 'toggle-break' ? 'Processing...' : (status === 'active' ? 'Take a Break (Pause)' : 'Resume Session')}
                </Button>
                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={onEndSession}
                    disabled={!!loadingAction}
                >
                    {loadingAction === 'end-session' ? 'Ending...' : 'End Session'}
                </Button>
            </CardContent>
        </Card>
    );
}
