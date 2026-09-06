import { payloadDataService } from '@/services/api/server/payload-data.service';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import { AUTHORS_PER_PAGE } from '../constants/authors.constants';
import { PRODUCTS_PER_PAGE } from '../constants/products.constants';
import type { QueryParams } from '../types/query-params.type';

export const getProductsQueryOptions = (queryParams: QueryParams) => {
    const limit = queryParams.limit || PRODUCTS_PER_PAGE;

    const updatedQueryParams = { ...queryParams, limit };
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, updatedQueryParams],
        queryFn: () => payloadDataService.getProducts(updatedQueryParams),
        staleTime: 1000 * 60, // минута,
    };
};

export const getAuthorsQueryOptions = (queryParams: QueryParams) => {
    const limit = queryParams.limit || AUTHORS_PER_PAGE;

    const updatedQueryParams = { ...queryParams, limit };
    return {
        queryKey: [COLLECTION_SLUGS.AUTHORS, updatedQueryParams],
        queryFn: () => payloadDataService.getAuthors(updatedQueryParams),
        staleTime: 1000 * 60, // минута,
    };
};

export const getProductQueryOptions = ({ slug }: { slug: string }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, slug],
        queryFn: () => payloadDataService.getProductBySlug(slug),
        staleTime: 1000 * 60, // минута,
    };
};

export const getProductByIdQueryOptions = ({ id }: { id: number }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, id],
        queryFn: () => payloadDataService.getProductById(id),
        staleTime: 1000 * 60, // минута,
        retry: (failureCount: number, error: Error) => {
            // не ретраю 404
            if (error.message.includes('404 Not Found')) {
                return false;
            }
            return failureCount < 2;
        },
    };
};

export const getAuthorQueryOptions = ({ slug }: { slug: string }) => {
    return {
        queryKey: [COLLECTION_SLUGS.AUTHORS, slug],
        queryFn: () => payloadDataService.getAuthorBySlug(slug),
        staleTime: 1000 * 60, // минута,
    };
};

// TODO: возвращает весь Product, а не только slug. Причём много запросов, не оптимально - нужен фикс
export const getProductSlugQueryOptions = ({ id }: { id: number }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, id, 'slug'],
        queryFn: () => payloadDataService.getProductById(id),
        staleTime: 1000 * 60, // минута,
    };
};

export const getCategoriesQueryOptions = (queryParams: QueryParams) => {
    const limit = queryParams.limit || 100;
    const updatedQueryParams = { ...queryParams, limit, sort: 'label' };
    return {
        queryKey: [COLLECTION_SLUGS.CATEGORIES, queryParams],
        queryFn: () => payloadDataService.getCategories(updatedQueryParams),
        staleTime: 1000 * 60, // минута,
    };
};

export const getHomeSliderQueryOptions = () => {
    return {
        queryKey: [COLLECTION_SLUGS.HOME_SLIDER],
        queryFn: () => payloadDataService.getHomeSlides(),
        staleTime: 1000 * 60 * 60, // час,
    };
};
