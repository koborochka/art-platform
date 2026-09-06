import React from 'react';

import type { Metadata } from 'next';

import { buildMetadata } from '@/shared/utils/seo';

export const metadata: Metadata = buildMetadata({
    title: 'Регистрация',
    noindex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
