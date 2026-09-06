import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import HomeUI from '@/components/home/homeUI';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorsQueryOptions, getProductsQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default async function HomePage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(getProductsQueryOptions({ limit: 4 }));
    await queryClient.prefetchQuery(getAuthorsQueryOptions({ limit: 4 }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeUI />
        </HydrationBoundary>
    );
}
