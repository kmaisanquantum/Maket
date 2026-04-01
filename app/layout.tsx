import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maket — PNG Agri-Logistics',
  description: 'Live market prices and transport board for PNG coffee and cocoa farmers',
  manifest: '/manifest.json',
  applicationName: 'Maket PNG',
  keywords: ['PNG', 'coffee', 'cocoa', 'market prices', 'PMV', 'agri-logistics', 'Papua New Guinea'],
  authors: [{ name: 'DSPNG' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maket PNG',
  },
  openGraph: {
    title: 'Maket — PNG Agri-Logistics',
    description: 'Prais Bilong Maket na Bodi Bilong PMV',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a3d2b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
