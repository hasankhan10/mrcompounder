'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus(null);

        const formPayload = new FormData(event.currentTarget);
        formPayload.append("access_key", "1e4fe8c3-901f-46ab-8a40-99623595be86");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formPayload
            });

            const data = await response.json();

            if (data.success) {
                setSubmissionStatus('success');
                setFormData({ name: '', email: '', message: '' }); // Clear form
                toast.success("Message sent successfully!");
            } else {
                setSubmissionStatus('error');
                toast.error("Error sending message: " + data.message);
            }
        } catch (error) {
            console.error('Failed to submit contact form:', error);
            setSubmissionStatus('error');
            toast.error("Failed to connect to the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Tell Us About Your Clinic</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" placeholder='Clinic/ Hospital/ Doctor/ Nursing Home Name' name="name" value={formData.name} onChange={handleChange} required className="mt-1 bg-white" />
                </div>
                <div>
                    <Label htmlFor="email">Phone Number</Label>
                    <Input type="number" id="email" placeholder='Phone Number' name="email" value={formData.email} onChange={handleChange} required className="mt-1 bg-white" />
                </div>
                <div>
                    <Label htmlFor="message">What would you like help with?</Label>
                    <Textarea id="message" name="message" placeholder='Example: “I run an evening OPD with ~40 patients.
I want to reduce crowding.”' value={formData.message} onChange={handleChange} rows={5} required className="mt-1 bg-white" />
                </div>
                {/* Gotcha field for spam protection */}
                <Input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                <Button type="submit" className="w-full bg-teal-700 text-lg py-3 text-white hover:scale-105 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Request Free Setup'}
                </Button>
                {submissionStatus === 'success' && (
                    <p className="text-green-600 text-center mt-4">Message sent successfully! We&apos;ll get back to you soon.</p>
                )}
                {submissionStatus === 'error' && (
                    <p className="text-red-600 text-center mt-4">Failed to send message. Please try again later.</p>
                )}
            </form>
        </div>
    );
}
