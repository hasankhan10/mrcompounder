'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageErrorProps {
    message: string;
    onRetry?: () => void;
}

export function PageError({ message, onRetry }: PageErrorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-600">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center max-w-md">
                <Activity className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold mb-2">Access Error</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => {
                        setIsLoading(true);
                        router.push('/');
                    }} variant="outline" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Return Home
                    </Button>
                    {onRetry && <Button onClick={onRetry}>Try Again</Button>}
                </div>
            </div>
        </div>
    );
}
