import type { TypedUser } from 'payload';

import { UserType } from '@/shared/types/auth.interface';

export const isAdmin = (user: TypedUser | null) => {
    return user?.role === UserType.ADMIN;
};

export const isAuthor = (user: TypedUser | null) => {
    return user?.role === UserType.AUTHOR;
};

export const isCustomer = (user: TypedUser | null) => {
    return user?.role === UserType.CUSTOMER;
};

export const isCreateOperation = (operation: string) => operation === 'create';

export const isUpdateOperation = (operation: string) => operation === 'update';
