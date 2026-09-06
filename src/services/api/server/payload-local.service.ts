import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { Author, Product } from '@/shared/types/payload-types';

// Local API - прямой доступ к БД без HTTP
// Используется только в серверных компонентах

export class PayloadLocalService {
    private async findBySlug<T>(
        collection: (typeof COLLECTION_SLUGS)[keyof typeof COLLECTION_SLUGS],
        slug: string,
    ): Promise<T | null> {
        const payload = await getPayload({ config });
        const result = await payload.find({
            collection,
            where: { slug: { equals: slug } },
            limit: 1,
            depth: 2,
        });
        return (result.docs[0] as T) ?? null;
    }

    async getProductBySlug(slug: string): Promise<Product | null> {
        return this.findBySlug<Product>(COLLECTION_SLUGS.PRODUCTS, slug);
    }

    async getAuthorBySlug(slug: string): Promise<Author | null> {
        return this.findBySlug<Author>(COLLECTION_SLUGS.AUTHORS, slug);
    }

    async getAllProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
        const payload = await getPayload({ config });
        const data = await payload.find({
            collection: COLLECTION_SLUGS.PRODUCTS,
            limit: 0,
            pagination: false,
            depth: 0,
        });
        return data.docs
            .filter((d) => d.slug)
            .map((d) => ({
                slug: d.slug as string,
                updatedAt: d.updatedAt,
            }));
    }

    async getAllAuthorSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
        const payload = await getPayload({ config });
        const data = await payload.find({
            collection: COLLECTION_SLUGS.AUTHORS,
            limit: 0,
            pagination: false,
            depth: 0,
        });
        return data.docs
            .filter((d) => d.slug)
            .map((d) => ({
                slug: d.slug as string,
                updatedAt: d.updatedAt,
            }));
    }
}

export const payloadLocalService = new PayloadLocalService();
