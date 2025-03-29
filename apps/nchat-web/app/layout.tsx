import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';

const inter = Inter({ subsets: ['latin'] });

// Get the base URL from environment variable with a fallback
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'nchat',
  description: 'Connect and chat securely',
  manifest: '/manifest.json',
  metadataBase: new URL(baseUrl),
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#25D366' },
    { media: '(prefers-color-scheme: dark)', color: '#128C7E' }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icons/icon-192x192.png'],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/icon-512x512.png',
        color: '#25D366',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'nchat',
    startupImage: [
      {
        url: '/icons/screenshot-mobile.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  applicationName: 'nchat',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'nchat',
    title: 'nchat - Secure Messaging App',
    description: 'Connect and chat securely with nchat - your messaging app for everyday communication',
    images: [{ url: '/icons/screenshot-desktop.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nchat - Secure Messaging App',
    description: 'Connect and chat securely with nchat - your messaging app for everyday communication',
    images: ['/icons/screenshot-desktop.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#25D366" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#128C7E" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}