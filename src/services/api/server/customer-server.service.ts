import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { UserType } from '@/shared/types/auth.interface';
import type { ICustomerCreateInput, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';

export class CustomerServerService extends BaseServerService {
    async createCustomer(customerData: ICustomerCreateInput): Promise<void> {
        // Получаем экземпляр Payload для работы через Local API, напрямую с БД. Так как пользователь еще не авторизован
        const payload = await getPayload({ config });

        // Создаем пользователя через Local API
        // Это автоматически вызовет хук коллекции users, который создаст базовую запись Customer
        const user = await payload.create({
            collection: COLLECTION_SLUGS.USERS,
            data: {
                email: customerData.email,
                password: customerData.password,
                role: UserType.CUSTOMER,
            },
        });

        // Находим только что созданную запись customers
        const customers = await payload.find({
            collection: COLLECTION_SLUGS.CUSTOMERS,
            where: { user: { equals: user.id } },
            limit: 1,
            depth: 0,
        });

        const customer = customers.docs[0];
        if (!customer) throw new Error('Server: Customer entity was not created automatically');

        // Обновляем Customer дополнительными данными (ФИО, телефон)
        await payload.update({
            collection: COLLECTION_SLUGS.CUSTOMERS,
            id: customer.id,
            data: {
                fullName: customerData.fullName,
                phone: customerData.phone,
            },
        });
    }

    async getCustomerByUserId(userId: number, customHeaders?: Record<string, string>): Promise<Customer> {
        const url = apiUrl.collection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { user: { equals: userId } },
            limit: 1,
            depth: 0, // Нам чаще всего нужен просто ID
        });

        const headers = customHeaders || (await this.getAuthHeaders());

        const response = await fetch(url, {
            headers,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server: Failed to fetch customer. Status: ${response.status}. Body: ${errText}`);
        }

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            return data.docs[0];
        } catch (error) {
            console.error('Failed to parse customer response:', text, error);
            throw new Error('Invalid JSON received for customer');
        }
    }

    async updateCustomerProfile(
        customerId: number,
        updates: ICustomerUpdateInput,
        customHeaders?: Record<string, string>,
    ): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.CUSTOMERS, customerId);

        // Если переданы кастомные заголовки (как при регистрации), используем их
        // Иначе берем заголовки из текущего запроса (как при обычном обновлении профиля)
        const headers = customHeaders || (await this.getAuthHeaders());

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: headers,
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Server: Failed to update customer profile');
    }
}

export const customerServerService = new CustomerServerService();
