'use client';

import { useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

type UpdateOptions = {
    replace?: boolean;
    resetPage?: boolean;
};

export function useUpdateQueryParams<T extends Record<string, unknown>>() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateQueryParams = useCallback(
        (updates: Partial<T>, options: UpdateOptions = { replace: true, resetPage: true }) => {
            const { replace, resetPage } = options;
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    newParams.delete(key);
                    return;
                }

                newParams.set(key, String(value));
            });

            if (resetPage) newParams.set('page', '1');

            const qs = newParams.toString();
            const url = qs ? `?${qs}` : '/';
            if (replace) {
                router.replace(url, { scroll: false });
            } else {
                router.push(url, { scroll: false });
            }
        },
        [router, searchParams],
    );

    return updateQueryParams;
}
