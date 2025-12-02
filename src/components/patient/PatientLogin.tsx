import { FormEvent } from 'react';
import { Clinic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface PatientLoginProps {
    clinic: Clinic;
    phone: string;
    setPhone: (phone: string) => void;
    isLoading: boolean;
    error: string | null;
    onSubmit: (e: FormEvent) => void;
}

export function PatientLogin({
    clinic,
    phone,
    setPhone,
    isLoading,
    error,
    onSubmit
}: PatientLoginProps) {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    {clinic.logo_url ? (
                        <Image src={clinic.logo_url} alt="Logo" width={80} height={80} className="w-20 h-20 mx-auto rounded-xl mb-4 shadow-sm object-cover" />
                    ) : (
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl mb-4">
                            {clinic.name.charAt(0)}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
                    <p className="text-gray-500">Check your queue status</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="text-center text-2xl py-6 tracking-widest"
                            placeholder="9999999999"
                            maxLength={10}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
                    <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            'Check Status'
                        )}
                    </Button>
                </form>
            </div>
        </main>
    );
}
