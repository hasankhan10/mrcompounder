import { useState } from 'react';
import { toast } from 'sonner';
import { APP_NAME } from '@/lib/config';

interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error: {
        description: string;
    };
}

interface UseRazorpayOptions {
    clinicId?: string;
    clinicName?: string;
    clinicEmail?: string;
    clinicContact?: string;
    onSuccess?: () => void;
}

export function useRazorpay() {
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processPayment = async (amount: number, options: UseRazorpayOptions) => {
        const { clinicId, clinicName, clinicEmail, clinicContact, onSuccess } = options;

        if (amount <= 0) {
            toast.error('Invalid amount to pay');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Load Script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load');
                setIsLoading(false);
                return;
            }

            // 2. Create Order
            const res = await fetch('/api/payment/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    clinicId
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create order');
            }
            const order = await res.json();

            // 3. Open Razorpay
            const rzpOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: APP_NAME,
                description: `Bill Payment for ${clinicName || 'Clinic'}`,
                image: '/icon-192x192.png',
                order_id: order.id,
                handler: async function (response: RazorpaySuccessResponse) {
                    try {
                        const verifyRes = await fetch('/api/payment/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                amount: amount,
                                clinicId: clinicId
                            })
                        });

                        if (verifyRes.ok) {
                            toast.success('Payment Successful!');
                            if (onSuccess) onSuccess();
                            else window.location.reload();
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch {
                        toast.error('Payment verification error');
                    }
                },
                prefill: {
                    name: clinicName,
                    email: clinicEmail,
                    contact: clinicContact
                },
                theme: {
                    color: '#0d9488'
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(rzpOptions);
            rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
                toast.error(response.error.description || 'Payment Failed');
            });
            rzp.open();

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return { processPayment, isLoading };
}
