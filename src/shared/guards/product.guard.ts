import type { Product } from '../types/payload-types';

// TODO: может просто проверять typeof object === 'object', тк поля меняются в процессе разработки?
export const isProductData = (object: unknown): object is Product => {
    return (
        typeof object === 'object' &&
        object !== null &&
        'id' in object &&
        'title' in object &&
        'slug' in object &&
        'description' in object &&
        'price' in object
    );
};
