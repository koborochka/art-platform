// TODO: добавить префикс "I" к генерируемым интерфейсам (Author -> IAuthor)

import type { User } from './payload-types';

export interface ICredentials {
    email?: string;
    password?: string;
}

export enum UserType {
    CUSTOMER = 'customer',
    AUTHOR = 'author',
    ADMIN = 'admin',
}

export type UserRole = UserType.CUSTOMER | UserType.AUTHOR;

export type ISessionUser = Pick<User, 'id'>;
