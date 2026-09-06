'use client';

import React from 'react';

import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';

import { Badge } from '../ui/badge';

export default function CartButton({ isActive }: { isActive: boolean }) {
    const { cart } = useCartStore();
    const itemsCount = cart?.items?.length ?? 0;
    const href = PAGES.CART;
    return (
        <Link href={href}>
            <div className="p-2 relative w-fit cursor-pointer">
                <ShoppingBasket strokeWidth={1.5} size={24} className={`${isActive && 'text-my-accent'}`} />

                {itemsCount > 0 && (
                    <Badge
                        variant={'counter'}
                        className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 p-0 text-[12px] rounded-full hover:none"
                    >
                        {itemsCount}
                    </Badge>
                )}
            </div>
        </Link>
    );
}
