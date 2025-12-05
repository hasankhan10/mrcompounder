import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TrialCountdownProps {
    endDate: string;
}

export function TrialCountdown({ endDate }: TrialCountdownProps) {
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const calculateDaysLeft = () => {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            const now = new Date();
            const diffTime = end.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(diffDays > 0 ? diffDays : 0);
        };

        calculateDaysLeft();
        // Update every minute to keep it reasonably fresh without over-polling
        const timer = setInterval(calculateDaysLeft, 60000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (daysLeft === null) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100 text-sm font-medium animate-fade-in">
            <Clock className="w-4 h-4" />
            <span>
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in trial
            </span>
        </div>
    );
}
