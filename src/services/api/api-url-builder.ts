import { stringify } from 'qs-esm';

import type { QueryParams } from '@/shared/types/query-params.type';

export class ApiUrlBuilder {
    private readonly baseUrl: string;
    private readonly yookassaBaseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '').trim();
        this.yookassaBaseUrl = (process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3').replace(/\/$/, '').trim();
    }

    // Основной метод построения итогового URL (с параметрами запроса и без)
    private buildUrl(base: string, path?: string, params?: QueryParams): string {
        if (!path) return base;

        const cleanPath = path.replace(/^\/+/, '');
        const url = `${base}/${cleanPath}`;

        if (!params || Object.keys(params).length === 0) {
            return url;
        }

        const query = stringify(params, {
            addQueryPrefix: true,
            encodeValuesOnly: true, // важно для корректного where
            skipNulls: true,
        });

        return `${url}${query}`;
    }

    // Singleton Access
    private static instance: ApiUrlBuilder;
    public static getInstance(): ApiUrlBuilder {
        if (!ApiUrlBuilder.instance) {
            ApiUrlBuilder.instance = new ApiUrlBuilder();
        }
        return ApiUrlBuilder.instance;
    }

    // Получить URL для Payload коллекции
    public collection(slug: string, params: QueryParams = {}): string {
        return this.buildUrl(this.baseUrl, `/api/${slug}`, params);
    }

    // Получить URL для элемента Payload коллекции по slug и id
    public item(slug: string, id: string | number): string {
        return this.buildUrl(this.baseUrl, `/api/${slug}/${id}`);
    }

    // Получить адрес страницы сайта
    public publicPage = (pageName: string): string => {
        return this.buildUrl(this.baseUrl, pageName);
    };

    // Auth Routes
    public auth = {
        login: () => this.collection('users/login'),
        logout: () => this.collection('users/logout'),
        me: () => this.collection('users/me'),
        verify: (token: string) => this.collection(`users/verify/${token}`),
        forgotPassword: () => this.collection('users/forgot-password'),
        resetPassword: () => this.collection('users/reset-password'),
        register: () => this.collection('auth/register'),
    };

    // Кастомные эндпоинты:
    public customer = {
        profileUpdate: () => this.buildUrl(this.baseUrl, '/api/customer/profile/update'),
    };

    public author = {
        profileUpdate: () => this.buildUrl(this.baseUrl, '/api/author/profile/update'),
        // Если товары автора получаются через кастомный эндпоинт:
        products: (productId?: number) => {
            const path = '/api/author/products';
            return productId ? this.buildUrl(this.baseUrl, `${path}/${productId}`) : this.buildUrl(this.baseUrl, path);
        },
    };

    public order = {
        create: () => this.buildUrl(this.baseUrl, '/api/orders/create'),
        cancel: (id: number) => this.buildUrl(this.baseUrl, `/api/orders/${id}/cancel`),
    };

    public invoice = {
        export: (id: number) => this.buildUrl(this.baseUrl, `/api/invoices/${id}/export`),
    };

    public yookassa = {
        createPayment: () => this.buildUrl(this.yookassaBaseUrl, 'payments'),
        capturePayment: (paymentId: string) => this.buildUrl(this.yookassaBaseUrl, `payments/${paymentId}/capture`),
        cancelPayment: (paymentId: string) => this.buildUrl(this.yookassaBaseUrl, `payments/${paymentId}/cancel`),
    };
}

// Экспортируем единый инстанс для использования в сервисах
export const apiUrl = ApiUrlBuilder.getInstance();
