import { headers } from 'next/headers';

import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import type { ICredentials } from '@/shared/types/auth.interface';
import type { User } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';

export class AuthServerService extends BaseServerService {
    // Получение текущего пользователя (для Server Components)
    // Используем cookies из запроса
    async getCurrentUser(): Promise<User | null> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(apiUrl.auth.me(), {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
            cache: 'no-store', // TODO ?
        });

        if (!response.ok) return null;

        const responseData = await response.json();
        return responseData.user || null;
    }

    // Метод для получения куки сессии (логин на сервере)
    // Используется при регистрации, чтобы сразу выполнить действия от лица нового юзера
    async loginUser(email: string, password: string): Promise<string | null> {
        const url = apiUrl.auth.login();

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) return null;

        // Возвращаем строку с куками (payload-token)
        return response.headers.get('set-cookie');
    }

    async updateUserCredentials(userId: number, updates: ICredentials): Promise<void> {
        // Обновление email/password требует прав авторизованного пользователя
        const url = apiUrl.item(COLLECTION_SLUGS.USERS, userId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();

            // Достаём сообщение об ошибке от Payload
            const validationMessage = errorData.errors?.[0]?.message;
            const mainMessage = errorData.message;

            // Выбрасываем ошибку, содержащую детали (например, "The following field is invalid: email")
            throw new Error(validationMessage || mainMessage || 'Failed to update credentials');
        }
    }

    // Далее методы для работы с User сущностью

    async findUserByEmail(email: string): Promise<User | null> {
        const url = apiUrl.collection(COLLECTION_SLUGS.USERS, {
            where: { email: { equals: email } },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: await this.getAuthHeaders(),
        });
        if (!response.ok) return null;

        const data = await response.json();
        return data.docs[0] || null;
    }
}

export const authServerService = new AuthServerService();
