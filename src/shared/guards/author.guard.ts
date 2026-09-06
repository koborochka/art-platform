import type { Author } from '@/shared/types/payload-types';

export function isAuthorData(object: unknown): object is Author {
    return (
        typeof object === 'object' &&
        object !== null &&
        'id' in object &&
        'name' in object &&
        'slug' in object &&
        'bio' in object &&
        'avatar' in object &&
        'products_count' in object &&
        'product_categories' in object
    );
}
