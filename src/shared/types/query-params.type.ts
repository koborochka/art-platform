import type { AUTHORS_SORT_OPTIONS } from '../constants/authors.constants';
import type { PRODUCT_CATEGORIES, PRODUCTS_SORT_OPTIONS } from '../constants/products.constants';

export type QueryParams = {
    limit?: number;
    page?: number;
    where?: Record<string, unknown>;
    sort?: string;
    depth?: number;
    [key: string]: unknown;
};

export type ProductsQueryParams = ProductsFilters & {
    page?: number;
    sort?: ProductsSortOptions;
    limit?: number;
    excludeId?: number;
    authorId?: number;
};

export type ProductsFilters = {
    priceFrom?: number;
    priceTo?: number;
    search?: string;
    category?: string;
    authors?: string;
    tags?: string;
};

export type AuthorsQueryParams = AuthorsFilters & {
    page?: number;
    limit?: number;
    sort?: AuthorsSortOptions;
};

export type AuthorsFilters = {
    category?: string;
    search?: string;
};

export type ProductQueryParams = { product: string };

export type AuthorQueryParams = { author: string };

export type ProductsSortOptions = (typeof PRODUCTS_SORT_OPTIONS)[number]['value'] | undefined;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];

export type AuthorsSortOptions = (typeof AUTHORS_SORT_OPTIONS)[number]['value'] | undefined;
