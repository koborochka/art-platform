import { createNomenclature1C } from '@/server-actions/createNomenclature';
import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { isProductData } from '@/shared/guards/product.guard';
import type { IMediaResult, IOperationResult, IProductResult } from '@/shared/types/api.interface';
import { UserType } from '@/shared/types/auth.interface';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type {
    IInvoiceCreatePayloadData,
    IInvoiceItems,
    IInvoiceResult,
    IInvoiceUpdatePayloadData,
} from '@/shared/types/invoice.interface';
import type { IProductFormData } from '@/shared/types/product.type';

import { apiUrl } from '../api-url-builder';

export class AuthorClientService {
    async authenticate(email: string, password: string): Promise<IOperationResult> {
        try {
            const response = await fetch(apiUrl.auth.login(), {
                method: HTTP_METHODS.POST,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Важно для сохранения сессии // TODO ?
            });

            if (!response.ok) {
                return { success: false, error: 'Неверный email или пароль' };
            }

            const userData = await response.json();

            // Проверяем роль
            if (userData.user.role !== UserType.AUTHOR) {
                return { success: false, error: 'Доступ только для авторов' };
            }

            return { success: true };
        } catch (error) {
            console.error('Author authentication error:', error);
            return { success: false, error: 'Ошибка аутентификации' };
        }
    }

    async updateProfile(updates: IAuthorUpdateInput): Promise<IOperationResult> {
        const response = await fetch(apiUrl.author.profileUpdate(), {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Ошибка обновления профиля' };
        }
        return { success: true };
    }

    async createProduct(productData: IProductFormData, authorId: number): Promise<IProductResult> {
        if (!productData.category) {
            return { success: false, error: 'Не указана категория товара' };
        }

        const nomenclatureResult = await createNomenclature1C({
            authorId: authorId,
            categoryId: productData.category as number,
            productName: productData.title,
        });

        if (!nomenclatureResult.success || !nomenclatureResult.article) {
            return {
                success: false,
                error: nomenclatureResult.error ?? 'Не удалось создать номенклатуру в 1С',
            };
        }

        const payloadWithArticle: IProductFormData = {
            ...productData,
            article1C: nomenclatureResult.article,
        };

        const response = await fetch(apiUrl.author.products(), {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithArticle),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message };

        return { success: true, product: data.product };
    }

    async saveInvoice(authorId: number, items: IInvoiceItems): Promise<IInvoiceResult> {
        const url = apiUrl.collection(COLLECTION_SLUGS.INVOICES);

        const invoiceData: IInvoiceCreatePayloadData = {
            author: authorId,
            items: items.map((item, index) => ({
                orderNumber: index + 1,
                product: isProductData(item.product) ? item.product.id : item.product,
                quantity: item.quantity,
                price: item.price,
                condition: item.condition,
            })),
        };

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message || 'Ошибка сохранения накладной' };

        return { success: true, invoice: data.doc };
    }

    async updateInvoice(invoiceId: number, items: IInvoiceItems): Promise<IInvoiceResult> {
        const url = apiUrl.item(COLLECTION_SLUGS.INVOICES, invoiceId);

        const invoiceData: IInvoiceUpdatePayloadData = {
            items: items.map((item) => ({
                orderNumber: item.orderNumber,
                product: isProductData(item.product) ? item.product.id : item.product,
                quantity: item.quantity,
                price: item.price,
                condition: item.condition,
            })),
        };

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message || 'Ошибка обновления накладной' };

        return { success: true, invoice: data.doc };
    }

    async updateProduct(productId: number, productData: IProductFormData): Promise<IProductResult> {
        const response = await fetch(apiUrl.author.products(productId), {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message };

        return { success: true, product: data.product };
    }

    async deleteProduct(productId: number): Promise<IOperationResult> {
        const response = await fetch(apiUrl.author.products(productId), {
            method: HTTP_METHODS.DELETE,
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message || 'Ошибка удаления товара' };

        return { success: true };
    }

    async uploadMedia(file: File): Promise<IMediaResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(apiUrl.collection(COLLECTION_SLUGS.MEDIA), {
            method: HTTP_METHODS.POST,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message || 'Ошибка загрузки изображения' };

        return { success: true, media: data.doc };
    }
}

export const authorClientService = new AuthorClientService();
