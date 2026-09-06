'use client';

import { CircleUserRound, Home, LayoutList, ShoppingBasket, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { PAGES } from '@/config/public-pages.config';
import { useAuthStore } from '@/services/store/auth/store';
import { useCartStore } from '@/services/store/cart/store';

type navItem = {
    href: string;
    label: string;
    Icon: React.ElementType;
    isCart?: boolean;
    isProfile?: boolean;
};

const NAV_ITEMS: navItem[] = [
    { href: PAGES.HOME, label: 'Главная', Icon: Home },
    { href: PAGES.AUTHORS, label: 'Авторы', Icon: Users },
    { href: PAGES.PRODUCTS, label: 'Каталог', Icon: LayoutList },
    { href: PAGES.CART, label: 'Корзина', Icon: ShoppingBasket, isCart: true },
    { href: PAGES.PROFILE, label: 'Профиль', Icon: CircleUserRound, isProfile: true },
] as const;

function checkIsActive(href: string, pathName: string): boolean {
    try {
        return !!match(href, { decode: decodeURIComponent })(pathName);
    } catch {
        return pathName === href;
    }
}

export function MobileNav() {
    const pathName = usePathname();
    const { cart } = useCartStore();
    const user = useAuthStore((state) => state.user);

    const itemsCount = cart?.items?.length ?? 0;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-2px_16px_0_rgba(39,39,42,0.06)]">
            <ul className="flex items-stretch justify-around h-16">
                {NAV_ITEMS.map(({ href, label, Icon, isCart, isProfile }) => {
                    const resolvedHref = isProfile ? (user ? PAGES.PROFILE : PAGES.LOGIN) : href;

                    const isActive = isProfile
                        ? checkIsActive(PAGES.LOGIN, pathName) || checkIsActive(PAGES.PROFILE, pathName)
                        : checkIsActive(href, pathName);

                    return (
                        <li key={href} className="flex-1">
                            <Link
                                href={resolvedHref}
                                className="flex flex-col items-center justify-center gap-1 h-full w-full relative"
                            >
                                <span className="relative">
                                    <Icon strokeWidth={1.5} size={22} className={isActive ? 'text-my-accent' : ''} />
                                    {isCart && itemsCount > 0 && (
                                        <Badge
                                            variant="counter"
                                            className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 p-0 text-[10px] rounded-full"
                                        >
                                            {itemsCount}
                                        </Badge>
                                    )}
                                </span>
                                <span
                                    className={`text-[11px] leading-none font-medium ${
                                        isActive ? 'text-my-accent' : ''
                                    }`}
                                >
                                    {label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
