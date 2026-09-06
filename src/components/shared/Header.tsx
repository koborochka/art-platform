'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';

import { PAGES } from '@/config/public-pages.config';
import { useAuthStore } from '@/services/store/auth/store';

import CartButton from '../Menu/CartButton';
import { MENU } from '../Menu/menu.data';
import { MenuItem } from '../Menu/MenuItem';
import ProfileButton from '../Menu/ProfileButton';

function checkIsActive(href: string, pathName: string): boolean {
    try {
        return !!match(href, { decode: decodeURIComponent })(pathName);
    } catch {
        return pathName === href;
    }
}

export function Header() {
    const pathName = usePathname();
    const user = useAuthStore((state) => state.user);

    return (
        // hidden на мобильных, flex на md+
        <header className="hidden md:flex items-center justify-between py-4 mb-8 wrap px-3 lg:px-0">
            <Link href={PAGES.HOME} className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Minto Logo" width={80} height={40} priority />
            </Link>

            <nav className="flex gap-6">
                {MENU.map((menuItem) => (
                    <MenuItem
                        key={menuItem.name}
                        menuItem={menuItem}
                        isActive={checkIsActive(menuItem.href, pathName)}
                    />
                ))}
            </nav>

            <nav className="flex gap-4 items-center">
                <CartButton isActive={checkIsActive(PAGES.CART, pathName)} />
                <ProfileButton
                    isRegistered={!!user}
                    isActive={checkIsActive(PAGES.LOGIN, pathName) || checkIsActive(PAGES.PROFILE, pathName)}
                />
            </nav>
        </header>
    );
}
