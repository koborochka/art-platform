'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import { useFetchProduct } from '@/shared/hooks/useFetchData';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { Media } from '@/shared/types/payload-types';
import type { ProductQueryParams, ProductsQueryParams } from '@/shared/types/query-params.type';

import CounterButton, { Button } from '../ui/button';

import AuthorProductsSection from './AuthorProductsSection';
import ProductSlider from './ProductSlider';

export default function ProductUI({ initialParams }: { initialParams: ProductQueryParams }) {
    const slug = initialParams.product;
    const { data: product, isError, error, isFetching } = useFetchProduct({ slug });
    const { cart, addItem, increase, decrease } = useCartStore();
    const updateQueryParams = useUpdateQueryParams<ProductsQueryParams>();

    if (isError) return <div>Error: {error.message}</div>;
    if (isFetching) return <div>Loading...</div>;
    if (!product) notFound();

    const { id, title, description, gallery, price, author, quantity } = product;

    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item.product.id === id : item.product === id,
    );
    const isAvailable = price && price > 0 && quantity && quantity > 0;

    const images = gallery?.map((g) => g.image).filter((img) => isImageData(img)) || [];

    return (
        <div className="flex flex-col gap-8 md:gap-12 wrap mt-4 md:mt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 md:gap-x-10 p-4 md:p-6 lg:p-8 pt-4 md:pt-5 mb-10 md:mb-20 shadow-[0_3px_40px_0_rgba(39,39,42,0.05)] rounded-xl">
                {/* Слайдер */}
                <div className="md:col-span-7">
                    <ProductSlider gallery={images as Media[]} />
                </div>

                {/* Информация */}
                <div className="md:col-span-5">
                    <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16 lg:mb-26">
                        <h2 className="font-semibold text-2xl md:text-[28px] lg:text-[32px] leading-tight">{title}</h2>

                        <div className="flex flex-col gap-2">
                            {productInCart && isAvailable ? (
                                <CounterButton
                                    quantity={productInCart.quantity}
                                    boundary={quantity || 0}
                                    handleMinus={() => decrease(id)}
                                    handlePlus={() => increase(id)}
                                    variant="default"
                                />
                            ) : (
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => addItem(id)}
                                    disabled={!isAvailable}
                                >
                                    {isAvailable ? `${price} ₽` : 'Ждём поступления!'}
                                </Button>
                            )}
                            {isAvailable && (
                                <span className="text-my-accent font-[450] text-sm md:text-base">
                                    В наличии {quantity} шт
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 md:gap-10">
                        {description && (
                            <div className="flex flex-col gap-2 md:gap-3">
                                <h3 className="text-xl md:text-2xl font-semibold">Описание</h3>
                                <div className="text-my-tertriary text-base md:text-lg">{description}</div>
                            </div>
                        )}

                        {isAuthorData(author) && (
                            <div className="flex flex-col gap-2 md:gap-3">
                                <h3 className="text-xl md:text-2xl font-semibold">Автор</h3>
                                <Link
                                    href={PAGES.AUTHOR(author.slug!)}
                                    className="flex gap-3 items-center hover:underline text-my-secondary text-sm md:text-base cursor-pointer"
                                >
                                    <Image
                                        width={40}
                                        height={40}
                                        src={
                                            isImageData(author.avatar)
                                                ? author.avatar?.url || '/placeholder.png'
                                                : '/placeholder.png'
                                        }
                                        alt="avatar"
                                        className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
                                    />
                                    {author.name}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthorProductsSection product={product} updateQueryParams={updateQueryParams} />
        </div>
    );
}
