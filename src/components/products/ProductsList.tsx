'use client';

import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { toQueryParams } from '@/services/api/utils';
import { useFetchProducts } from '@/shared/hooks/useFetchData';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';
import { getPageNumbers } from '@/shared/utils/getPageNumbers';
import { cn } from '@/shared/utils/tailwind';

import { ProductsGridLoader } from '../shared/Skeleton';
import { Button } from '../ui/button';

import ProductCard from './ProductCard';

type ProductListProps = {
    initialParams: ProductsQueryParams;
    updateQueryParams: (params: Partial<ProductsQueryParams>, options?: { resetPage?: boolean }) => void;
};

export default function ProductsList({ initialParams, updateQueryParams }: ProductListProps) {
    const page = Number(initialParams.page) || 1;
    const params = toQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchProducts(params);
    const products = data?.docs;

    if (isError) return <div>Error: {error.message}</div>;
    if (isFetching) return <ProductsGridLoader productsCount={16} columnsCount={4} />;
    if (!products) return <div className="text-xl md:text-2xl font-semibold text-center mt-8">Товаров не найдено.</div>;

    const { hasNextPage = false, hasPrevPage = false, prevPage, nextPage, totalPages = 1 } = data;

    return (
        <>
            <div
                className={cn(
                    'grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-3 lg:px-0',
                    isPlaceholderData && 'opacity-50',
                )}
            >
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {products.length === 0 ? (
                <div className="text-xl md:text-2xl font-semibold text-center mt-8">Ничего не нашлось.</div>
            ) : (
                <div className="flex gap-1 md:gap-2 justify-center items-center mt-6 md:mt-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQueryParams({ page: prevPage || page - 1 }, { resetPage: false })}
                        disabled={!hasPrevPage}
                        className="h-8 w-8 md:h-10 md:w-10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers(totalPages, page).map((pageNum, idx) =>
                        typeof pageNum === 'number' ? (
                            <Button
                                key={idx}
                                variant={pageNum === page ? 'pagination' : 'ghost'}
                                onClick={() => updateQueryParams({ page: pageNum }, { resetPage: false })}
                                className="h-8 w-8 md:h-10 md:w-10 text-sm md:text-base"
                            >
                                {pageNum}
                            </Button>
                        ) : (
                            <span key={idx} className="px-1 md:px-2 text-muted-foreground text-sm">
                                {pageNum}
                            </span>
                        ),
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQueryParams({ page: nextPage || page + 1 }, { resetPage: false })}
                        disabled={!hasNextPage}
                        className="h-8 w-8 md:h-10 md:w-10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
    );
}
