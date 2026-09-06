import React from 'react';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import {
    OG_DEFAULT_IMAGE,
    SITE_DESCRIPTION,
    SITE_KEYWORDS,
    SITE_LOCALE,
    SITE_NAME,
    SITE_TITLE,
    SITE_URL,
} from '@/config/seo.config';

import Providers from './providers';
import QueryDevtools from './QueryDevtools';

import './globals.css';
import '@/styles/global.scss';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        template: `%s — ${SITE_NAME}`,
        default: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: SITE_NAME,
    alternates: { canonical: '/' },
    verification: {
        google: 'vGc0Vdoa96CDHTL6cA5peDbuYBU8lzvdYld5A6R4nEc', // search.google.com
        yandex: '0bca2688285c0cc8', // webmaster.yandex.ru
    },
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        locale: SITE_LOCALE,
        url: SITE_URL,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [OG_DEFAULT_IMAGE],
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
                <Providers>
                    {children}
                    <QueryDevtools />
                </Providers>
            </body>
        </html>
    );
}
