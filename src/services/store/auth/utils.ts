import type { ISessionUser } from '@/shared/types/auth.interface';
import type { User } from '@/shared/types/payload-types';

// Функция для фильтрации чувствительных данных
export const toSessionUser = (user: User | null): ISessionUser | null => {
    if (!user) return null;

    return {
        id: user.id,
    };
};
