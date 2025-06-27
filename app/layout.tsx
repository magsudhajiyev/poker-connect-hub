import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Poker Connect Hub',
  description: 'Connect, Share & Improve Your Poker Game',
  keywords: 'poker, social, sharing, analysis, community',
  authors: [{ name: 'Poker Connect Hub' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Poker Connect Hub',
    description: 'Connect, Share & Improve Your Poker Game',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poker Connect Hub',
    description: 'Connect, Share & Improve Your Poker Game',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
        <Script
          defer
          data-website-id="685ddcc27bfc18641c45214b"
          data-domain="pokerconnect.me"
          src="https://datafa.st/js/script.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
