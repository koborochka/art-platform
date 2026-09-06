import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { type IOrderCreateRequest, type IOrderCreateResponse } from '@/shared/types/order.interface';
import type { Order } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

export class OrderClientService {
    // Создание заказа через кастомный эндпоинт
    async createOrder(orderData: IOrderCreateRequest): Promise<IOrderCreateResponse> {
        const url = apiUrl.order.create();

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include', // Обязательно передаем cookies ??? TODO зачем?
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to create order');
        }

        return data as IOrderCreateResponse;
    }

    // Отмена заказа через кастомный эндпоинт
    async cancelOrder(orderId: number): Promise<void> {
        const url = apiUrl.order.cancel(orderId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || data.error || 'Failed to cancel order');
        }
    }

    async getOrdersByCustomer(customerId: number): Promise<Order[]> {
        const url = apiUrl.collection(COLLECTION_SLUGS.ORDERS, {
            where: { customer: { equals: customerId } },
            depth: 2,
        });

        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Отправляем куки авторизации для доступа к заказам
        });

        if (!response.ok) {
            console.error('Client: Failed to fetch orders');
            return [];
        }

        const data = await response.json();
        return data.docs || [];
    }
}

export const orderClientService = new OrderClientService();
