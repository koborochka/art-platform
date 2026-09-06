import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import ProductsUI from '@/components/products/ProductsUI';
import { toQueryParams } from '@/services/api/utils';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getCategoriesQueryOptions, getProductsQueryOptions } from '@/shared/utils/getDataQueryOptions';
import { buildMetadata } from '@/shared/utils/seo';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<ProductsQueryParams>;
}): Promise<Metadata> {
    const sp = await searchParams;
    // Фильтры/пагинацию не индексируем, чтобы не было дублей
    const hasFilters = Object.keys(sp ?? {}).length > 0;

    return buildMetadata({
        title: 'Каталог товаров',
        description:
            'Каталог уникальных авторских работ от художников и мастеров. Найдите то, что вдохновляет именно вас.',
        path: '/products',
        noindex: hasFilters,
    });
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ProductsQueryParams> }) {
    // Получаем параметры из поисковой строки
    const productsQueryParams = await searchParams;

    // Преобразуем в QueryParams для запроса к серверу
    const queryParams = toQueryParams(productsQueryParams);

    // Prefetch текущей страницы и следующей
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getProductsQueryOptions(queryParams));
    await queryClient.prefetchQuery(
        getProductsQueryOptions({ ...queryParams, page: queryParams?.page ? queryParams.page + 1 : 1 }),
    );

    await queryClient.prefetchQuery(getCategoriesQueryOptions({}));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsUI initialParams={productsQueryParams} />
        </HydrationBoundary>
    );
}
