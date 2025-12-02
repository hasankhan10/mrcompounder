import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Toaster } from 'sonner';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from '@/components/seo/JsonLd';
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
    default: `${APP_NAME} - Smart Queue Management`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mrcompounder.com',
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png', // You should add an og-image.png to your public folder
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  verification: {
    google: 'rUa5vkdxLeHoXy5bVbe0pRkZ1NsmDne-nwcaRvnUVBI',
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
      </body>
    </html>
  );
}
