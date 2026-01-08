import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Toaster } from 'sonner';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from '@/components/seo/JsonLd';
import { ChatBot } from '@/components/shared/ChatBot';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mrcompounder.com'),
  title: {
    default: `Mr Compounder | Silent OPD System for Clinics & Hospitals`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Stop OPD shouting. Simple patient flow control for Indian clinics. Works on any Android phone. No apps, no subscriptions. Pay only per patient.',
  keywords: [
    'silent opd',
    'clinic token system',
    'patient calling system',
    'opd management software india',
    'queue management for doctors',
    'mr compounder',
    'clinic patient queue',
    'digital token system',
    'hospital queue management',
    'clinic crowd control',
    'patient flow management'
  ],
  authors: [{ name: 'Mehedi Hassan' }],
  creator: 'Mehedi Hassan',
  publisher: 'Mehedi Hassan',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mrcompounder.com',
    siteName: APP_NAME,
    title: `Mr Compounder | Silent OPD System for Clinics & Hospitals`,
    description: 'Stop OPD shouting. Simple patient flow control for Indian clinics. Works on any Android phone. No apps, no subscriptions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mr Compounder - Silent OPD System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Mr Compounder | Silent OPD System for Clinics & Hospitals`,
    description: 'Stop OPD shouting. Simple patient flow control for Indian clinics. Works on any Android phone.',
    images: ['/og-image.png'],
    creator: '@mrcompounder',
  },
  verification: {
    google: 'rUa5vkdxLeHoXy5bVbe0pRkZ1NsmDne-nwcaRvnUVBI',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${hindSiliguri.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster richColors position="bottom-right" />
        <Analytics />
        <JsonLd />
        <ChatBot />
      </body>
    </html>
  );
}
