'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import type { ICartItem } from '@/shared/types/cart.interface';
import { cn } from '@/shared/utils/tailwind';

import { Button, CounterButton } from '../ui/button';
import { Card } from '../ui/card';

export default function CartItem({ item, available }: { item: ICartItem; available: boolean }) {
    const { toggleChecked, increase, decrease } = useCartStore();

    const product = item.product;

    if (!isProductData(product)) return null;

    const productId = product.id;
    const price = product.price ?? 0;
    const stock = product.quantity ?? 0;

    const mainImage = product.gallery && isImageData(product.gallery[0]?.image) ? product.gallery[0].image : '';
    const imageSrc = (typeof mainImage === 'object' && mainImage?.url) || '/placeholder.png';

    return (
        <Card className="flex w-full p-0 overflow-hidden flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex flex-row items-center w-full gap-3 p-3 md:contents">
                <div className="relative shrink-0 w-20 h-20 md:w-30 md:h-30">
                    <Link href={PAGES.PRODUCT(product.slug)}>
                        <Image src={imageSrc} alt={product.title} fill className="object-cover rounded-lg" />
                    </Link>
                </div>

                <div className="flex md:hidden flex-col flex-1 min-w-0 gap-1.5">
                    {available ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-lg font-bold text-my-primary leading-none">
                                {(price * item.quantity).toLocaleString()} ₽
                            </span>
                            <span className="text-xs text-my-tertriary">({price.toLocaleString()} ₽ / шт)</span>
                        </div>
                    ) : (
                        <div className="text-xs text-my-tertriary">({price.toLocaleString()} ₽ / шт)</div>
                    )}

                    <Link href={PAGES.PRODUCT(product.slug)}>
                        <div className="font-semibold leading-tight text-my-primary line-clamp-2 text-sm">
                            {product.title}
                        </div>
                    </Link>

                    {available && (
                        <>
                            <div className="text-xs text-my-accent font-medium">В наличии {stock} шт.</div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <div
                                    className={cn(
                                        'flex items-center cursor-pointer select-none transition-colors',
                                        item.checked ? 'text-my-accent' : 'text-my-primary',
                                    )}
                                >
                                    <Checkbox checked={item.checked ?? false} onCheckedChange={() => toggleChecked(productId)} />
                                    <span className="text-sm font-medium pl-2" onClick={() => toggleChecked(productId)}>Выбрать</span>
                                </div>
                                <CounterButton
                                    variant="secondary"
                                    quantity={item.quantity}
                                    boundary={stock}
                                    handleMinus={() => decrease(productId)}
                                    handlePlus={() => increase(productId)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden md:grid grid-cols-4 md:grid-cols-3 flex-row h-full w-full p-4 gap-6">
                    <div className="col-span-2 md:col-span-1 flex flex-col flex-1 gap-4 justify-between">
                        <Link href={PAGES.PRODUCT(product.slug)}>
                            <div className="font-semibold leading-tight text-my-primary line-clamp-2">
                                {product.title}
                            </div>
                        </Link>
                        {available && (
                            <div
                                className={cn(
                                    'flex items-center cursor-pointer select-none transition-colors',
                                    item.checked ? 'text-my-accent' : 'text-my-primary',
                                )}
                            >
                                <Checkbox checked={item.checked ?? false} onCheckedChange={() => toggleChecked(productId)} />
                                <span className="text-sm font-medium pl-2" onClick={() => toggleChecked(productId)}>Выбрать</span>
                            </div>
                        )}
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 justify-center items-center text-center">
                        {available && (
                            <div className="text-xl font-bold text-my-primary">
                                {(price * item.quantity).toLocaleString()} ₽
                            </div>
                        )}
                        <div className="text-my-tertriary text-sm">{price.toLocaleString()} ₽ / шт.</div>
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 justify-center items-center">
                        {available ? (
                            <>
                                <CounterButton
                                    variant="secondary"
                                    quantity={item.quantity}
                                    boundary={stock}
                                    handleMinus={() => decrease(productId)}
                                    handlePlus={() => increase(productId)}
                                />
                                <div className="text-[15px] text-my-accent font-[450]">В наличии {stock} шт.</div>
                            </>
                        ) : (
                            <Button className="w-full" variant={'pagination'} disabled>
                                Нет в наличии
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {!available && (
                <Button className="md:hidden w-full rounded-none" variant={'pagination'} disabled>
                    Нет в наличии
                </Button>
            )}
        </Card>
    );
}
