import React, { Suspense } from 'react';

import type { Metadata } from 'next';

import { PAGES } from '@/config/public-pages.config';
import { buildMetadata } from '@/shared/utils/seo';

import LoginFormUI from './LoginFormUI';

export const metadata: Metadata = buildMetadata({ title: 'Вход', noindex: true });

interface LoginPageProps {
    searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const redirectUrl = params.redirect || PAGES.PROFILE;

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <LoginFormUI redirectUrl={redirectUrl} />
        </Suspense>
    );
}
