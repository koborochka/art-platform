import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { toAuthorsQueryParams } from '@/services/api/utils';
import type { AuthorsQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorsQueryOptions } from '@/shared/utils/getDataQueryOptions';
import { buildMetadata } from '@/shared/utils/seo';

import AuthorsUI from '../../../components/authors/AuthorsUI';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<AuthorsQueryParams>;
}): Promise<Metadata> {
    const sp = await searchParams;
    // Фильтры/пагинацию не индексируем, чтобы не было дублей
    const hasFilters = Object.keys(sp ?? {}).length > 0;

    return buildMetadata({
        title: 'Авторы',
        description: 'Художники и мастера магазина Минто — авторы уникальных изделий ручной работы.',
        path: '/authors',
        noindex: hasFilters,
    });
}

export default async function AuthorsPage({ searchParams }: { searchParams: Promise<AuthorsQueryParams> }) {
    // Получаем параметры из поисковой строки
    const authorsQueryParams = await searchParams;

    // Преобразуем в QueryParams для запроса к серверу
    const queryParams = toAuthorsQueryParams(authorsQueryParams);

    // Prefetch текущей страницы и следующей
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getAuthorsQueryOptions(queryParams));
    await queryClient.prefetchQuery(
        getAuthorsQueryOptions({ ...queryParams, page: queryParams?.page ? queryParams.page + 1 : 1 }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AuthorsUI initialParams={authorsQueryParams} />
        </HydrationBoundary>
    );
}
