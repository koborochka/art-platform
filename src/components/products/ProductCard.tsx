'use client';
import React, { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CounterButton, { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import type { Product } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function ProductCard({
    id,
    title,
    slug,
    price,
    author,
    gallery,
    quantity,
    priority = false,
}: Product & { priority?: boolean }) {
    const router = useRouter();
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    const { cart, addItem, increase, decrease } = useCartStore();
    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item?.product.id == id : item.product == id,
    );

    const mainImage = gallery && isImageData(gallery[0]?.image) ? gallery[0].image : '';
    const isAvailable = price && price > 0 && quantity && quantity > 0;

    const handleCardClick = () => router.push(PAGES.PRODUCT(slug));

    const handleCardActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className="cursor-pointer"
            onClick={handleCardClick}
            onMouseEnter={() =>
                (timerRef.current = setTimeout(() => {
                    queryClient.prefetchQuery(getProductQueryOptions({ slug }));
                }, 300))
            }
            onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
        >
            <Card className="p-0 overflow-hidden h-full">
                <CardHeader className="relative w-full aspect-square overflow-hidden">
                    <Image
                        alt="Картинка"
                        src={(typeof mainImage === 'object' && mainImage?.url) || '/placeholder.png'}
                        fill
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        priority={priority}
                        loading={priority ? undefined : 'lazy'}
                    />
                </CardHeader>

                <CardContent className="flex flex-col flex-1 mb-auto p-3 md:p-4">
                    <div className="flex flex-col gap-2 md:gap-3 mb-auto">
                        <CardTitle className="text-sm lg:text-lg">{title}</CardTitle>
                        <CardDescription>
                            {isAuthorData(author) && (
                                <Link
                                    href={PAGES.AUTHOR(author.slug!)}
                                    className="text-my-tertriary hover:underline text-xs lg:text-base"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {author.name}
                                </Link>
                            )}
                        </CardDescription>
                    </div>
                    <CardAction className="w-full cursor-default mt-3" onClick={handleCardActionClick}>
                        {productInCart ? (
                            <CounterButton
                                variant="default"
                                quantity={productInCart.quantity}
                                boundary={quantity || 0}
                                handleMinus={() => decrease(id)}
                                handlePlus={() => increase(id)}
                            />
                        ) : (
                            <Button
                                className="w-full text-xs md:text-sm"
                                variant="secondary"
                                onClick={() => addItem(id)}
                                disabled={!isAvailable}
                            >
                                {isAvailable ? `${price} ₽` : 'Нет в наличии'}
                            </Button>
                        )}
                    </CardAction>
                </CardContent>
            </Card>
        </div>
    );
}
