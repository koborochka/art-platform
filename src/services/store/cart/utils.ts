import type { Cart } from '@/shared/types/payload-types';

export const isStoreExists = () => {
    return typeof window !== 'undefined';
};

export const getCart = () => {
    if (isStoreExists()) {
        return JSON.parse(localStorage.getItem('cart-storage') || '[]');
    } else {
        return EMPTY_CART;
    }
};

export const EMPTY_CART: Partial<Cart> = { id: -1, items: [] };
