'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmissionStatus('success');
            setFormData({ name: '', email: '', message: '' }); // Clear form
        } catch (error) {
            console.error('Failed to submit contact form:', error);
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 bg-white" />
                </div>
                <div>
                    <Label htmlFor="email">Your Email</Label>
                    <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 bg-white" />
                </div>
                <div>
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required className="mt-1 bg-white" />
                </div>
                <Button type="submit" className="w-full bg-teal-700 text-lg py-3 text-white hover:scale-105 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
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
