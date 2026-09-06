'use client';

import dynamic from 'next/dynamic';

const ReactQueryDevtoolsProduction =
    process.env.NODE_ENV === 'development'
        ? dynamic(() => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools), { ssr: false })
        : null;

export default function QueryDevtools() {
    if (!ReactQueryDevtoolsProduction) {
        return null;
    }
    return <ReactQueryDevtoolsProduction />;
}
