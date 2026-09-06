// Документация https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

// In Next.js, this file would be called: app/providers.tsx
'use client';
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top

import React, { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/services/store/auth/store';
import { getQueryClient } from '@/shared/utils/get-query-client';

export default function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient();

    // Инициализация состояния аутентификации (для хранения user)
    // TODO: в клиентских  методах брать user из стора, а не доп запросом как сейчас
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
