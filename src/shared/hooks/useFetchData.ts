'use client';

import { useQueries, useQuery } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/services/api/server/payload-data.service';

import type { Author, Category, HomeSlider, Product } from '../types/payload-types';
import type { QueryParams } from '../types/query-params.type';
import {
    getAuthorQueryOptions,
    getAuthorsQueryOptions,
    getCategoriesQueryOptions,
    getHomeSliderQueryOptions,
    getProductByIdQueryOptions,
    getProductQueryOptions,
    getProductSlugQueryOptions,
    getProductsQueryOptions,
} from '../utils/getDataQueryOptions';

export const useFetchProducts = (queryParams: QueryParams) => {
    return useQuery<PaginatedResponse<Product>>({
        ...getProductsQueryOptions({ ...queryParams }),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchAuthors = (queryParams: QueryParams) => {
    return useQuery<PaginatedResponse<Author>>({
        ...getAuthorsQueryOptions({ ...queryParams }),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchHomeSlider = () => {
    return useQuery<PaginatedResponse<HomeSlider>>({
        ...getHomeSliderQueryOptions(),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchCategories = (queryParams?: QueryParams) => {
    return useQuery<PaginatedResponse<Category>>({
        ...getCategoriesQueryOptions({ ...queryParams }),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchProduct = ({ slug }: { slug: string }) => {
    return useQuery<Product | null>(getProductQueryOptions({ slug }));
};

export const useFetchProductById = ({ id }: { id: number }) => {
    return useQuery<Product | null>(getProductByIdQueryOptions({ id }));
};

export const useProductsByIds = (ids: number[]) => {
    const queries = useQueries({
        queries: ids.map((id) => ({
            ...getProductByIdQueryOptions({ id }),
        })),
    });

    const isLoading = queries.some((q) => q.isLoading);

    const realErrorQuery = queries.find((q) => q.isError && q.error);

    const isError = Boolean(realErrorQuery);
    const error = realErrorQuery?.error ?? null;

    const products = queries.map((q) => q.data).filter(Boolean) as Product[];

    const invalidIds: number[] = queries
        .map((q, index) => {
            const id = ids[index];

            if (q.isError) return id;
            if (!q.isLoading && !q.data) return id;

            return null;
        })
        .filter((id): id is number => id !== null);

    return {
        data: products,
        isLoading,
        isError,
        error,
        invalidIds,
        dataUpdatedAt: queries.map((q) => q.dataUpdatedAt).join(','),
    };
};

export const useFetchAuthor = ({ slug }: { slug: string }) => {
    return useQuery<Author | null>(getAuthorQueryOptions({ slug }));
};

export const useProductSlugs = (productIds: number[]) => {
    const queries = useQueries({
        queries: productIds.map((id) => getProductSlugQueryOptions({ id })),
    });

    const isLoading = queries.some((q) => q.isLoading);
    const isError = queries.some((q) => q.isError);

    const slugMap = queries.reduce(
        (acc, query, index) => {
            const productId = productIds[index];
            if (productId && query.data?.slug) {
                acc[productId] = query.data.slug;
            }
            return acc;
        },
        {} as Record<number, string>,
    );

    return {
        slugMap,
        isLoading,
        isError,
    };
};

// export const useFetchMedia = ({ id }: { id: number }) => {
//     return useQuery<Media | null>(getMediaQueryOptions({ id }));
// };
