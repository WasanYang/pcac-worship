import type { Metadata } from 'next';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Worship Flow',
  description: 'Streamline your worship service planning and team management.',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1DB954',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='apple-touch-icon' href='/icons/192.png'></link>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className='font-body antialiased'>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
