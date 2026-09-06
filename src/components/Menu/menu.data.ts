import { PAGES } from '@/config/public-pages.config';

export interface IMenuItem {
    href: string;
    name: string;
    requiresAuth?: boolean;
    guestOnly?: boolean;
}

export const MENU: IMenuItem[] = [
    {
        href: PAGES.PRODUCTS,
        name: 'Товары',
    },
    {
        href: PAGES.AUTHORS,
        name: 'Авторы',
    },
    {
        href: PAGES.ABOUT,
        name: 'О нас',
    },
];
