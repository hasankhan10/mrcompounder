// clinicline/src/app/(public)/contact/page.tsx
'use client'; // This page will have client-side interactivity for the form

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming shadcn Textarea is available
import { Label } from '@/components/ui/label';

export default function ContactUsPage() {
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

    // In a real application, you would send this data to an API endpoint
    // e.g., /api/contact, which then handles sending an email.

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
    <div className="bg-white text-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
            Get in Touch With Us
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or need a free setup, our team is here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Contact Details</h2>
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <div>
                <p className="text-lg font-semibold">Email Us</p>
                <p className="text-gray-600">support@clinicline.in</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.868 8.868 0 01-4.767-1.353L2 18l1.395-3.111A8.995 8.995 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="text-lg font-semibold">WhatsApp Us</p>
                <p className="text-gray-600">
                  <a href="https://wa.me/917001717263" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    +917001717263 (Click to Chat)
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
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
              <Button type="submit" className="w-full bg-blue-700 text-lg py-3 text-white hover:scale-105 transition-all" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              {submissionStatus === 'success' && (
                <p className="text-green-600 text-center mt-4">Message sent successfully! We'll get back to you soon.</p>
              )}
              {submissionStatus === 'error' && (
                <p className="text-red-600 text-center mt-4">Failed to send message. Please try again later.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
