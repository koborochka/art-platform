import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { authClientService } from '@/services/api/client/auth-client.service';
import type { ISessionUser } from '@/shared/types/auth.interface';
import type { User } from '@/shared/types/payload-types';

import { toSessionUser } from './utils';

interface AuthState {
    user: ISessionUser | null;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    setUser: (user: User | null) => void;
    clearUser: () => void;
    initialize: () => Promise<void>;
    checkAuth: () => Promise<ISessionUser | null>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                isLoading: false,
                isInitialized: false,

                setUser: (user) => set({ user: toSessionUser(user) }),

                clearUser: () => set({ user: null }),

                initialize: async () => {
                    // Проверяем только если еще не инициализировали
                    if (get().isInitialized) return;

                    set({ isLoading: true });
                    try {
                        const user = await authClientService.getCurrentUser();
                        set({
                            user: toSessionUser(user),
                            isInitialized: true,
                        });
                    } catch (error) {
                        console.error('Auth initialization error:', error);
                        set({ isInitialized: true });
                    } finally {
                        set({ isLoading: false });
                    }
                },

                checkAuth: async () => {
                    set({ isLoading: true });
                    try {
                        const user = await authClientService.getCurrentUser();
                        const safeUser = toSessionUser(user);
                        set({ user: safeUser });
                        return safeUser;
                    } catch (error) {
                        console.error('Auth check error:', error);
                        set({ user: null });
                        return null;
                    } finally {
                        set({ isLoading: false });
                    }
                },

                logout: async () => {
                    set({ isLoading: true });
                    try {
                        await authClientService.logout();
                        set({ user: null });
                    } catch (error) {
                        console.error('Logout error:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                },
            }),
            {
                name: 'auth-storage',
                // Сохраняем только безопасные данные
                partialize: (state) => ({
                    user: state.user, // Это уже ISessionUser
                    isInitialized: state.isInitialized,
                }),
                // TODO: Дополнительная защита, шифрование
                // serialize: (state) => {
                //     return JSON.stringify(state);
                // },
                // deserialize: (str) => {
                //     return JSON.parse(str);
                // },
            },
        ),
    ),
);
