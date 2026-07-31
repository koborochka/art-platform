import { URL_SEPARATOR } from '@/shared/constants/constants';
import type { AuthorsQueryParams, ProductsQueryParams, QueryParams } from '@/shared/types/query-params.type';

// ProductsQueryParams -> QueryParams
export function toQueryParams(params: ProductsQueryParams): QueryParams {
    const { page, sort, limit, search, authors, category, tags, priceFrom, priceTo, excludeId, authorId } = params;

    const where: Record<string, unknown> = {};

    if (search) {
        where.or = [{ title: { like: search } }, { description: { like: search } }];
    }
    if (category) {
        const categories = category.split(URL_SEPARATOR).filter(Boolean);
        where['category.value'] = categories.length > 1 ? { in: categories } : { equals: categories[0] };
    }
    if (authors) {
        const authorsArray = authors.split(URL_SEPARATOR).map((a) => a.trim());
        where['author.name'] = authorsArray.length > 1 ? { in: authorsArray } : { equals: authorsArray[0] };
    }
    if (tags) where.tags = { in: tags.split(URL_SEPARATOR) };
    if (priceFrom) where.price = { ...(where.price || {}), greater_than_equal: priceFrom };
    if (priceTo) where.price = { ...(where.price || {}), less_than_equal: priceTo };

    if (excludeId) {
        where.id = { not_equals: excludeId };
    }
    if (authorId) {
        where.author = { equals: authorId };
    }

    const finalWhere = {
        and: [
            ...(Object.keys(where).length > 0 ? [where] : []),
            { price: { not_equals: 0 } },
            { price: { exists: true } },
            { quantity: { not_equals: 0 } },
            { quantity: { exists: true } },
        ],
    };

    return {
        ...(page ? { page: Number(page) } : { page: 1 }),
        ...(limit ? { limit } : {}),
        sort,
        where: finalWhere,
        // depth: 1,
    };
}

// AuthorsQueryParams -> QueryParams для Payload API
export function toAuthorsQueryParams(params: AuthorsQueryParams): QueryParams {
    const { page, limit, sort, search, category } = params;

    const where: Record<string, unknown> = {};

    if (search) {
        // ищем по имени или био автора
        where.or = [{ name: { like: search } }, { bio: { like: search } }];
    }
    if (category) {
        const categories = category.split(URL_SEPARATOR).filter(Boolean);

        if (categories.length > 1) {
            where['product_categories.category'] = { in: categories };
        } else {
            where['product_categories.category'] = { equals: categories[0] };
        }
    }

    return {
        ...(page ? { page: Number(page) } : { page: 1 }),
        ...(limit ? { limit } : {}),
        ...(sort ? { sort } : {}),
        ...(Object.keys(where).length ? { where } : {}),
    };
}
