'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical System Error</h2>
                    <p className="text-gray-600 mb-6">The application encountered a critical error and cannot recover.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reload Application
                    </button>
                </div>
            </body>
        </html>
    );
}
