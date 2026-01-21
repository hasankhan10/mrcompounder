import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface SessionStatusCardProps {
    status: 'active' | 'paused';
    doctorName: string;
    shareToken?: string;
    onToggleBreak: () => void;
    onEndSession: () => void;
    loadingAction: string | null;
}

export function SessionStatusCard({ status, doctorName, shareToken, onToggleBreak, onEndSession, loadingAction }: SessionStatusCardProps) {
    const [copied, setCopied] = React.useState(false);

    const handleShare = () => {
        if (!shareToken) return;
        const url = `${window.location.origin}/q/${shareToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Access link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-none shadow-md bg-white overflow-hidden">
            <div className={`h-2 ${status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                    <span>Session Status</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {status}
                    </span>
                </CardTitle>
                <p className="text-sm text-slate-500">Doctor: <span className="font-medium text-slate-900">{doctorName}</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
                {shareToken && (
                    <Button
                        variant="outline"
                        className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 font-bold gap-2"
                        onClick={handleShare}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Copied Link' : 'Share Access Link'}
                    </Button>
                )}

                <div className="pt-2 space-y-3">
                    <Button
                        variant="outline"
                        className={`w-full font-medium ${status === 'active' ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800' : 'border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800'}`}
                        onClick={onToggleBreak}
                        disabled={!!loadingAction}
                    >
                        {loadingAction === 'toggle-break' ? 'Processing...' : (status === 'active' ? 'Take a Break' : 'Resume Session')}
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full font-medium"
                        onClick={onEndSession}
                        disabled={!!loadingAction}
                    >
                        {loadingAction === 'end-session' ? 'Ending...' : 'End Session'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
