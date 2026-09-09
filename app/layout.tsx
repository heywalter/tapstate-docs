import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Provider } from '@/components/provider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { docsBaseUrl, isSiteIndexable } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(docsBaseUrl),
  title: {
    default: 'Tapstate',
    template: '%s | tapstate',
  },
  robots: isSiteIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
