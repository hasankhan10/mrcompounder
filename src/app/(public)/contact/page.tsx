import { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch',
  description: 'Have questions or need a free setup? Contact the Mr Compounder team via email or WhatsApp. We are here to help.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactUsPage() {
  return (
    <div className="bg-white text-slate-800 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Get in Touch With Us
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            We&apos;d love to hear from you! Whether you have questions, feedback, or need a free setup, our team is here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Contact Details</h2>
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <div>
                <p className="text-lg font-semibold">Email Us</p>
                <p className="text-slate-600">Update Soon...</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.868 8.868 0 01-4.767-1.353L2 18l1.395-3.111A8.995 8.995 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="text-lg font-semibold">WhatsApp Us</p>
                <p className="text-slate-600">
                  <a href="https://wa.me/917001717263" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                    (Click to Chat)
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
