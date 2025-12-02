import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Toaster } from 'sonner';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';
import { Analytics } from "@vercel/analytics/react";
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
  title: `${APP_NAME} - Smart Queue Management`,
  description: APP_DESCRIPTION,
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
      </body>
    </html>
  );
}
