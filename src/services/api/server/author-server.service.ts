import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { Author, Invoice, Product } from '@/shared/types/payload-types';
import type { IProductCreateInput, IProductUpdateInput } from '@/shared/types/product.type';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';

export class AuthorServerService extends BaseServerService {
    async getAuthorByUserId(userId: number): Promise<Author | null> {
        const url = apiUrl.collection(COLLECTION_SLUGS.AUTHORS, {
            where: { user: { equals: userId } },
            limit: 1,
            depth: 1,
        });

        const response = await fetch(url, {
            headers: await this.getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to get author data');
            return null;
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    async getAuthorProducts(authorId: number): Promise<Product[]> {
        const url = apiUrl.collection(COLLECTION_SLUGS.PRODUCTS, {
            where: { author: { equals: authorId } },
            depth: 1, // depth=1 чтобы подтянуть связи (категории и т.д.)
            limit: 1000, // Отключаем пагинацию для профиля
        });

        const response = await fetch(url, {
            headers: await this.getAuthHeaders(),
            cache: 'no-store', // Для админки важно свежее состояние ??? TODO
        });

        if (!response.ok) {
            throw new Error('Server: Не удалось получить товары автора');
        }

        const data = await response.json();
        return data.docs || [];
    }

    async getAuthorLatestInvoice(authorId: number): Promise<Invoice | null> {
        const url = apiUrl.collection(COLLECTION_SLUGS.INVOICES, {
            where: { author: { equals: authorId } },
            limit: 1,
            depth: 1, // Чтобы подтянулись данные товаров
        });

        const response = await fetch(url, {
            headers: await this.getAuthHeaders(),
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to get invoice data');
            return null;
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    async createAuthorProduct(productData: IProductCreateInput): Promise<Product> {
        const url = apiUrl.collection(COLLECTION_SLUGS.PRODUCTS);

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(productData),
        });

        if (!response.ok) throw new Error('Server: Failed to create author product');

        const data = await response.json();
        return data.doc || data;
    }

    async updateAuthorProduct(productId: number, updates: IProductUpdateInput): Promise<Product> {
        const url = apiUrl.item(COLLECTION_SLUGS.PRODUCTS, productId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Server: Failed to update author product');

        const data = await response.json();
        return data.doc || data;
    }

    async updateAuthorProfile(authorId: number, updates: IAuthorUpdateInput): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.AUTHORS, authorId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Server: Failed to update author profile');
    }

    async deleteAuthorProduct(productId: number): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.PRODUCTS, productId);

        const response = await fetch(url, {
            method: HTTP_METHODS.DELETE,
            headers: await this.getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Server: Failed to delete product');
    }
}

export const authorServerService = new AuthorServerService();
