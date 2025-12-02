import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface PatientBookingSelectionProps {
    bookings: any[];
    onSelect: (booking: any) => void;
    onBack: () => void;
}

export function PatientBookingSelection({ bookings, onSelect, onBack }: PatientBookingSelectionProps) {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:pt-10">
            <div className="w-full max-w-md space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Doctor</h1>
                    <p className="text-gray-500">You have bookings with multiple doctors.</p>
                </div>

                <div className="grid gap-4">
                    {bookings.map((b, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect(b)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                        >
                            {b.queue.doctor_image_url ? (
                                <Image src={b.queue.doctor_image_url} alt={b.queue.doctor_name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {b.queue.doctor_name?.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{b.queue.doctor_name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-500">Token #{b.token.token_number}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${b.token.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                        b.token.status === 'called' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {b.token.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button variant="ghost" className="w-full" onClick={onBack}>
                    Back to Search
                </Button>
            </div>
        </main>
    );
}
