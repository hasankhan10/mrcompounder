import { FormEvent } from 'react';
import Image from 'next/image';
import { FileUpload } from '@/components/ui/file-upload';

interface UpiSettingsTabProps {
    upiSettings: { upi_id: string; qr_code_url: string };
    setUpiSettings: (settings: { upi_id: string; qr_code_url: string }) => void;
    qrFile: File | null;
    setQrFile: (file: File | null) => void;
    onSave: (e: FormEvent) => void;
    isLoading: boolean;
}

export function UpiSettingsTab({
    upiSettings,
    setUpiSettings,
    qrFile,
    setQrFile,
    onSave,
    isLoading,
}: UpiSettingsTabProps) {
    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">UPI Payment Settings</h2>
            <form onSubmit={onSave} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        UPI ID
                    </label>
                    <input
                        type="text"
                        value={upiSettings.upi_id}
                        onChange={(e) =>
                            setUpiSettings({ ...upiSettings, upi_id: e.target.value })
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g. admin@upi"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        QR Code Image
                    </label>
                    {upiSettings.qr_code_url && (
                        <div className="mb-2 relative w-48 h-48 border rounded">
                            <Image
                                src={upiSettings.qr_code_url}
                                alt="QR Code"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                    <FileUpload
                        value={qrFile}
                        onChange={setQrFile}
                        accept="image/*"
                        label="Upload QR Code"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Upload a clear image of your QR code.
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
                >
                    {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
