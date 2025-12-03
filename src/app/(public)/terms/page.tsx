// clinicline/src/app/(public)/terms/page.tsx
import { APP_NAME } from '@/lib/config';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Usage Guidelines',
  description: 'Review the Terms and Conditions for using Mr Compounder. Understand your rights and obligations.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose lg:prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>

          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-8">
            <p className="font-bold">Disclaimer:</p>
            <p>This is a template and not legal advice. You must consult with a legal professional to ensure your Terms and Conditions are compliant and suit your business needs.</p>
          </div>

          <p className="lead">Last updated: November 27, 2025</p>

          <p>Please read these terms and conditions carefully before using Our Service.</p>

          <h2>Interpretation and Definitions</h2>
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

          <h2>Acknowledgment</h2>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and {APP_NAME}. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
          <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users, and others who access or use the Service.</p>
          <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>

          <h2>User Accounts (For Clinics)</h2>
          <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>
          <p>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password. You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware of any breach of security or unauthorized use of Your account.</p>

          <h2>Billing and Payment</h2>
          <p>Our Service operates on a prepaid, metered basis. Each clinic account maintains a prepaid balance. For each patient token marked as &quot;served,&quot; a fee of ₹1 (one Indian Rupee) will be deducted from Your prepaid balance.</p>
          <p>You are responsible for maintaining a positive balance. If Your balance is zero or negative, We reserve the right to suspend or limit access to the Service, including preventing the creation of new patient tokens, until the balance is topped up.</p>
          <p>All payments for top-ups are non-refundable.</p>

          <h2>Use of the Service</h2>
          <p>You agree to use the Service only for its intended purpose of queue management within your clinic. You may not use the Service for any illegal or unauthorized purpose.</p>

          <h2>Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, in no event shall {APP_NAME} or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service).</p>

          <h2>&quot;As Is&quot; and &quot;As Available&quot; Disclaimer</h2>
          <p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, {APP_NAME}, on its own behalf and on behalf of its affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.</p>

          <h2>Governing Law</h2>
          <p>The laws of India, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
          <ul>
            <li>By email: support@clinicline.in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
