import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { FileUpload } from '@/components/ui/file-upload';

interface RechargeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RechargeModal({ isOpen, onOpenChange }: RechargeModalProps) {
    const [settings, setSettings] = useState({ upi_id: 'admin@upi', qr_code_url: '' });
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            const fetchSettings = async () => {
                const { data } = await supabase.from('system_settings').select('*');
                if (data) {
                    const map = data.reduce((acc: any, curr) => {
                        acc[curr.key] = curr.value;
                        return acc;
                    }, {});
                    setSettings({
                        upi_id: map.upi_id || 'admin@upi',
                        qr_code_url: map.qr_code_url || ''
                    });
                }
            };
            fetchSettings();
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(settings.upi_id);
        toast.success('UPI ID copied to clipboard');
    };

    const handleSubmit = async () => {
        if (!amount || !file) {
            toast.error('Amount and Screenshot are required');
            return;
        }
        setSubmitting(true);
        try {
            const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Upload to 'payment-proofs' bucket
            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(fileName, file);

            if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(fileName);

            const res = await fetch('/api/dashboard/recharge/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    screenshotUrl: publicUrl
                })
            });

            if (!res.ok) throw new Error('Failed to submit request');

            toast.success('Request submitted! Admin will verify shortly.');
            onOpenChange(false);
            // Reset form
            setAmount('');
            setFile(null);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Recharge Your Wallet</DialogTitle>
                    <DialogDescription>
                        1. Scan QR / Pay to UPI ID.<br />
                        2. Fill the form below to request top-up.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center space-y-4 w-full">
                        <div className="w-64 h-64 bg-white rounded-xl shadow-sm border-2 border-gray-100 p-2 flex items-center justify-center">
                            {settings.qr_code_url ? (
                                <img src={settings.qr_code_url} alt="Payment QR" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <p className="text-sm">QR Code Loading...</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full max-w-xs space-y-2 text-center">
                            <p className="text-sm font-medium text-gray-500">Scan to Pay or use UPI ID</p>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <code className="flex-1 font-mono font-bold text-xl text-blue-900 break-all">
                                    {settings.upi_id}
                                </code>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-100" onClick={handleCopy}>
                                    <Copy className="h-4 w-4 text-blue-700" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="w-full space-y-4 border-t pt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="e.g. 500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot</label>
                            <FileUpload
                                value={file}
                                onChange={setFile}
                                accept="image/*"
                                label="Upload payment proof"
                            />
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Payment Request'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
