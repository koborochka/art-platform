import { HTTP_METHODS } from '@/shared/constants/constants';
import type { User } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

export class AuthClientService {
    // Выход (для Client Components)
    async logout(): Promise<void> {
        await fetch(apiUrl.auth.logout(), {
            method: HTTP_METHODS.POST,
            credentials: 'include',
        });
    }

    // Получение текущего пользователя (для Client Components)
    async getCurrentUser(): Promise<User | null> {
        const response = await fetch(apiUrl.auth.me(), {
            credentials: 'include',
            cache: 'no-store',
        });

        if (!response.ok) {
            return null; // 401 или ошибка сети
        }

        const responseData = await response.json();
        return responseData.user || null;
    }
}

export const authClientService = new AuthClientService();
