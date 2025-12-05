import { PaymentRequest } from '@/lib/types';
import { PaymentRequestsSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import Image from 'next/image';

interface PaymentsTabProps {
    paymentRequests: PaymentRequest[];
    isLoading: boolean;
    onAction: (requestId: string, action: 'approve' | 'reject', amount?: number) => void;
}

export function PaymentsTab({ paymentRequests, isLoading, onAction }: PaymentsTabProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold">Pending Bill Payments</h2>
            {isLoading ? (
                <PaymentRequestsSkeleton />
            ) : paymentRequests.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
            ) : (
                <ErrorBoundary name="Bill Payments">
                    <div className="grid gap-4">
                        {paymentRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-bold text-lg">{req.clinics?.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Requested: {new Date(req.created_at).toLocaleString()}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-bold">
                                            ₹{req.amount}
                                        </span>
                                        {req.transaction_id && (
                                            <span className="text-sm text-slate-600 font-mono">
                                                Txn: {req.transaction_id}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <a
                                        href={req.screenshot_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-24 h-24 border rounded overflow-hidden bg-slate-100 hover:opacity-80 transition relative"
                                    >
                                        <Image
                                            src={req.screenshot_url}
                                            alt="Proof"
                                            fill
                                            className="object-cover"
                                        />
                                    </a>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => onAction(req.id, 'approve', req.amount)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onAction(req.id, 'reject')}
                                            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 font-medium"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ErrorBoundary>
            )}
        </div>
    );
}
