import { REVALIDATE_TIME } from '@/config/seo.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { Author, Category, HomeSlider, Product } from '@/shared/types/payload-types';
import type { QueryParams } from '@/shared/types/query-params.type';

import { apiUrl } from '../api-url-builder';

// TODO: вынести типы
export type PaginatedResponse<T> = {
    docs: T[];
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number | null;
    page: number;
    pagingCounter: number;
    prevPage: number | null;
    totalDocs: number;
    totalPages: number;
};

export type CollectionSlug = (typeof COLLECTION_SLUGS)[keyof typeof COLLECTION_SLUGS];

// TODO: для production включить ISR

// Сервис для работы с Payload CMS API
export class PayloadDataService {
    // Универсальный метод для получения данных коллекции
    private async getCollection<T>(
        slug: CollectionSlug,
        params: QueryParams = {},
        fetchOptions: RequestInit = { next: { revalidate: REVALIDATE_TIME, tags: [slug] } }, // ISR по умолчанию
        // fetchOptions: RequestInit = { cache: 'no-store' }, // SSR для разработки, всегда свежие данные
    ): Promise<PaginatedResponse<T>> {
        const url = apiUrl.collection(slug, params);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            // Пытаемся прочитать текст ошибки
            const errorText = await response.text();
            throw new Error(
                `Failed to fetch collection ${slug}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error(`JSON Parse Error for URL: ${url}`);
            console.error('Received response:', text.slice(0, 500)); // Логируем начало ответа
            throw new Error(`Invalid JSON response from ${slug}`, error as Error);
        }
    }

    private async getItem<T>(
        slug: CollectionSlug,
        id: number,
        fetchOptions: RequestInit = { next: { revalidate: REVALIDATE_TIME, tags: [slug] } },
        // fetchOptions: RequestInit = { cache: 'no-store' }, // SSR для разработки, всегда свежие данные
    ): Promise<T> {
        const url = apiUrl.item(slug, id);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to fetch item ${slug}/${id}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error(`JSON Parse Error for URL: ${url}`);
            console.error('Received response:', text.slice(0, 500));
            throw new Error(`Invalid JSON response from item ${slug}/${id}`, error as Error);
        }
    }

    async getProducts(params?: QueryParams): Promise<PaginatedResponse<Product>> {
        return this.getCollection(COLLECTION_SLUGS.PRODUCTS, { ...params, depth: 1 }); // depth=1 подтянет категории
    }

    // Получение списка товаров по по списку ID
    async getProductsByIds(ids: number[]): Promise<Product[]> {
        if (ids.length === 0) return [];

        const data = await this.getCollection<Product>(
            COLLECTION_SLUGS.PRODUCTS,
            {
                where: {
                    id: { in: ids },
                },
                depth: 0, // только данные товара
                pagination: false,
            },
            { cache: 'no-store' },
        ); // важно не кешировать цену

        return data.docs;
    }

    async getAuthors(params?: QueryParams): Promise<PaginatedResponse<Author>> {
        return this.getCollection(COLLECTION_SLUGS.AUTHORS, { ...params, depth: 1 });
    }

    async getProductBySlug(slug: string): Promise<Product | null> {
        const result = await this.getCollection<Product>(
            COLLECTION_SLUGS.PRODUCTS,
            {
                where: { slug: { equals: slug } },
                limit: 1,
                pagination: false, // Отключаем пагинацию для оптимизации
            },
            {
                next: {
                    revalidate: REVALIDATE_TIME,
                    tags: [COLLECTION_SLUGS.PRODUCTS, `product:${slug}`],
                },
            },
        );
        return result.docs[0] ?? null;
    }

    async getAuthorBySlug(slug: string): Promise<Author | null> {
        const result = await this.getCollection<Author>(
            COLLECTION_SLUGS.AUTHORS,
            {
                where: { slug: { equals: slug } },
                limit: 1,
                pagination: false,
            },
            {
                next: {
                    revalidate: REVALIDATE_TIME,
                    tags: [COLLECTION_SLUGS.AUTHORS, `author:${slug}`],
                },
            },
        );
        return result.docs[0] ?? null;
    }

    async getProductById(id: number): Promise<Product> {
        return this.getItem(COLLECTION_SLUGS.PRODUCTS, id);
    }

    async getCategories(params: QueryParams): Promise<PaginatedResponse<Category>> {
        return this.getCollection(COLLECTION_SLUGS.CATEGORIES, { ...params, depth: 1 });
    }

    async getHomeSlides(): Promise<PaginatedResponse<HomeSlider>> {
        return this.getCollection<HomeSlider>(COLLECTION_SLUGS.HOME_SLIDER, { limit: 100 });
    }
}

export const payloadDataService = new PayloadDataService();

// SSG - статика, при сборке все данные сохраняем, пользователи быстро берут значения из кеша. Нужна пересборка для обновления
// SSR - всегда актуальная информация на сайте, но больше нагрузка на сервер т.к данные генерируются при каждом запросе
// ISR - практически нет нагрузки на сервер, тк страницы кешируются, и при этом обновления данных происходят без пересборки
