// clinicline/src/app/(public)/privacy/page.tsx
import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose lg:prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>

          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-8">
            <p className="font-bold">Disclaimer:</p>
            <p>This is a template and not legal advice. You must consult with a legal professional to ensure your Privacy Policy is compliant with regulations like the GDPR, CCPA, and local laws.</p>
          </div>

          <p className="lead">Last updated: November 27, 2025</p>

          <p>Clinic Line (&quot;We&quot;, &quot;Our&quot;, &quot;Us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

          <h2>Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>

          <h3>Clinic and Compounder Information</h3>
          <ul>
            <li>Personally identifiable information, such as your name, email address, and clinic details (name, slug, logo), that you voluntarily give to us when you are registered by our admin team.</li>
          </ul>

          <h3>Patient Information</h3>
          <ul>
            <li><strong>Phone Numbers:</strong> When a patient joins a queue, we collect their phone number to assign a token for a single session. This number is used solely for the purpose of managing the queue for that specific session.</li>
            <li>We do not require patient names, and we do not create permanent patient accounts. Phone numbers are tied only to a temporary session token.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
          <ul>
            <li>Create and manage your clinic account.</li>
            <li>Manage the queue system and patient flow.</li>
            <li>Process payments and manage your prepaid balance.</li>
            <li>Send push notifications to patients about their queue status (if they grant permission).</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
          </ul>

          <h2>Data Security</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. We rely on the security measures of our trusted third-party service providers, including Supabase (for database and authentication) and Vercel (for hosting).</p>
          <p>While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2>Data Retention</h2>
          <p>We will retain your information only for as long as is necessary for the purposes set out in this Privacy Policy.</p>
          <ul>
            <li><strong>Clinic & Compounder Data:</strong> We will retain your account information as long as your account is active.</li>
            <li><strong>Patient Phone Numbers:</strong> A patient&apos;s phone number is associated with a token and a queue session. We may retain this data for a limited period for billing and auditing purposes, after which it may be anonymized or deleted. It is not used for any purpose outside of queue management for the session they joined.</li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>Our Service relies on the following third-party providers:</p>
          <ul>
            <li><strong>Supabase:</strong> For our database, authentication, and real-time services.</li>
            <li><strong>Vercel:</strong> For hosting our web application.</li>
            <li><strong>Firebase Cloud Messaging (FCM):</strong> For sending web push notifications.</li>
          </ul>
          <p>We are not responsible for the data collection or privacy practices of these third parties. We encourage you to review their privacy policies.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, You can contact us:</p>
          <ul>
            <li>By email: support@clinicline.in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
