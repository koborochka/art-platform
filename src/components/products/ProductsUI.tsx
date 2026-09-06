'use client';

import React from 'react';

import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';

import ProductFiltersBar from './ProductFiltersBar';
import ProductsList from './ProductsList';

export default function ProductsUI({
    initialParams,
    showAuthorFilter,
}: {
    initialParams: ProductsQueryParams;
    showAuthorFilter?: boolean;
}) {
    const updateQueryParams = useUpdateQueryParams<ProductsQueryParams>();

    return (
        <div className="wrap">
            <h1 className="text-3xl font-semibold mb-8 px-3 lg:px-0">Товары</h1>
            <ProductFiltersBar
                filters={{
                    authors: initialParams.authors,
                    tags: initialParams.tags,
                    priceFrom: initialParams.priceFrom,
                    priceTo: initialParams.priceTo,
                    category: initialParams.category,
                    search: initialParams.search,
                }}
                sort={initialParams.sort}
                onFilterChange={(value) =>
                    updateQueryParams({
                        category: value.category,
                        authors: value.authors,
                        tags: value.tags,
                        priceFrom: value.priceFrom,
                        priceTo: value.priceTo,
                        search: value.search,
                    })
                }
                onSortChange={(value) => updateQueryParams({ sort: value })}
                showAuthorFilter={showAuthorFilter}
            />
            <ProductsList initialParams={initialParams} updateQueryParams={updateQueryParams} />
        </div>
    );
}
